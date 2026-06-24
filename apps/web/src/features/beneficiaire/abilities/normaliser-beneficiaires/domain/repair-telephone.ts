import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'

const tryTelephone = (value: string): Telephone | null => {
  try {
    return Telephone(value)
  } catch {
    return null
  }
}

// Indicatifs connus (cf. TELEPHONE_PATTERN) — pour retirer un 0 de jonction
// redondant écrit juste après l'indicatif (ex. +262 0692… → +262 692…).
const KNOWN_PREFIX = /^(\+(?:33|262|352|590|594|596))0/

/**
 * Répare un téléphone stocké potentiellement abîmé vers sa forme canonique
 * (international), ou `null` si irrécupérable. Candidats essayés dans l'ordre :
 *  1. tel quel (déjà valide / canonique) ;
 *  2. le 1er numéro — champs multi-numéros séparés par retour à la ligne ou
 *     « / » — compacté (espaces et séparateurs parasites retirés) ;
 *  3. `00` de tête ramené à `0` (0 parasite : `00604…` → `0604…`) ;
 *  4. 0 de jonction redondant retiré après un indicatif connu (`+2620692…`) ;
 *  5. avec un 0 de tête, pour un numéro à 9 chiffres saisi sans son 0.
 *
 * Réservé au backfill : le value object `Telephone` reste strict pour les
 * saisies utilisateur (un numéro abîmé doit y être rejeté, pas réparé).
 */
export const repairTelephone = (raw: string): Telephone | null => {
  const first = raw.split(/[\r\n/]+/)[0] ?? raw
  const compact = first.replace(/[^\d+]/g, '')
  const digits = first.replace(/\D/g, '')
  const candidates = [
    raw,
    compact,
    compact.replace(/^00/, '0'),
    compact.replace(KNOWN_PREFIX, '$1'),
    ...(digits.length === 9 ? [`0${digits}`] : []),
  ]

  return candidates.reduce<Telephone | null>(
    (found, candidate) => found ?? tryTelephone(candidate),
    null,
  )
}
