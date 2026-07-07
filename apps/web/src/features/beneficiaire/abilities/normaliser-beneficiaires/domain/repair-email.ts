import { Email } from '@app/web/features/beneficiaire/domain/email'

const tryEmail = (value: string): Email | null => {
  try {
    return Email(value)
  } catch {
    return null
  }
}

// Domaines de fournisseurs grand public : servent à réinsérer un point manquant
// (gmailcom → gmail.com) et un `@` oublié (chantval85gmail.com →
// chantval85@gmail.com).
const FOURNISSEURS = [
  'gmail.com',
  'yahoo.fr',
  'yahoo.com',
  'hotmail.fr',
  'hotmail.com',
  'outlook.fr',
  'outlook.com',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
  'neuf.fr',
  'sfr.fr',
  'skynet.be',
  'icloud.com',
  'live.fr',
  'live.com',
  'laposte.net',
  'proton.me',
  'aol.com',
  'msn.com',
]

// Domaines sans point réparables sans ambiguïté, plus les TLD absents quand une
// seule forme existe (gmail → gmail.com ; pas hotmail/outlook nus : .fr et
// .com coexistent).
const DOMAINE_REPARE: Record<string, string> = {
  gmail: 'gmail.com',
  ...Object.fromEntries(
    FOURNISSEURS.map((domaine) => [domaine.replace(/\./g, ''), domaine]),
  ),
}

const avecDomaineRepare = (email: string): string => {
  const parts = email.split('@')
  if (parts.length !== 2) return email
  const [local, domaine] = parts
  const repare = DOMAINE_REPARE[domaine.toLowerCase()]
  return repare ? `${local}@${repare}` : email
}

const avecArobaseInseree = (value: string): string => {
  if (value.includes('@')) return value
  const fournisseur = FOURNISSEURS.find(
    (domaine) =>
      value.toLowerCase().endsWith(domaine) && value.length > domaine.length,
  )
  return fournisseur
    ? `${value.slice(0, -fournisseur.length)}@${fournisseur}`
    : value
}

// Les fournisseurs n'acceptant pas les caractères accentués, l'adresse réelle
// est la forme ASCII (françoise → francoise, sœur → soeur).
const sansAccents = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')

/**
 * Répare un email stocké potentiellement abîmé vers sa forme canonique
 * (minuscules, sans bords), ou `null` si irrécupérable. Candidats essayés dans
 * l'ordre :
 *  1. tel quel (déjà valide / canonique) ;
 *  2. le 1er token contenant `@` — champs multi-adresses séparées par retour à
 *     la ligne, « ; » ou espace, texte ou téléphone accolé ;
 *  3. ponctuation finale parasite retirée (`;`, `'`, `>`…) ;
 *  4. virgule tapée à la place du point (`@yahoo,fr`) ;
 *  5. `@` dédoublé ramené à un seul (`thlesellier@@laposte.net`) ;
 *  6. accents translittérés (`françoise@` → `francoise@`) ;
 *  7. domaine connu réparé (`@gmailcom`, `@gmail` → `@gmail.com`) ;
 *  8. TLD tronqué `.f` complété en `.fr` ;
 *  9. `@` restitué devant un fournisseur connu (`chantval85gmail.com`) ;
 * 10. espaces internes retirés (`lyse .brehaut@`, `…99 @gmail.com`) ;
 * 11. espace tapé à la place du point du TLD (`tovichra@yahoo fr`).
 * Les caractères invisibles (contrôle/format Unicode) sont retirés d'emblée.
 *
 * Réservé au backfill : le value object `Email` reste strict pour les saisies
 * utilisateur (une adresse abîmée doit y être rejetée, pas réparée).
 */
export const repairEmail = (raw: string): Email | null => {
  const visible = raw.replace(/\p{Cf}/gu, '')
  const premier =
    visible.split(/[\s;]+/).find((part) => part.includes('@')) ?? visible
  const candidates = [
    visible,
    premier,
    premier.replace(/[^a-z0-9]+$/i, ''),
    premier.replace(/,/g, '.'),
    premier.replace(/@@+/g, '@'),
    sansAccents(premier),
    avecDomaineRepare(premier),
    premier.replace(/\.f$/i, '.fr'),
    avecArobaseInseree(premier),
    visible.replace(/\s+/g, ''),
    visible.replace(/^(\S+@\S+)\s+([a-z]{2,3})$/i, '$1.$2'),
  ]

  return candidates.reduce<Email | null>(
    (found, candidate) => found ?? tryEmail(candidate),
    null,
  )
}

// Mentions d'absence d'adresse (« A créer », « pas d'email », « pas d'adresse
// mail », « pas de mail pour l'instant ») — à vider, pas à conserver en erreur.
const MENTIONS_ABSENCE = [/^a créer$/i, /^pas d['e ].*mail/i]

/** Mention « pas d'adresse » saisie à la place d'un email — à vider. */
export const emailAbsent = (raw: string): boolean =>
  MENTIONS_ABSENCE.some((mention) => mention.test(raw.trim()))
