import { emailAbsent, repairEmail } from './repair-email'

describe('repairEmail', () => {
  it.each([
    ['marie@curie.fr', 'marie@curie.fr'], // déjà canonique
    ['  Marie@Curie.FR ', 'marie@curie.fr'], // bords/casse (via le VO)
    ['farnesekif@gmail.com;', 'farnesekif@gmail.com'], // ponctuation finale
    ['rachelceva77@gmail.com>', 'rachelceva77@gmail.com'],
    ["henrybressolette@msn.com'", 'henrybressolette@msn.com'],
    ['fes39@outlook.fr\r\nfati@gmail.com', 'fes39@outlook.fr'], // multi retour ligne → 1er
    ['dussert.Chantal@icloud.com; cjp@free.fr', 'dussert.chantal@icloud.com'], // multi « ; » → 1er
    ['jptenel@gmail.com - mntenel@gmail.com', 'jptenel@gmail.com'], // multi tiret → 1er
    ['0646004199 alain.carville01@gmail.com', 'alain.carville01@gmail.com'], // téléphone accolé
    ['tivoli_2006@yahoo,fr', 'tivoli_2006@yahoo.fr'], // virgule → point
    ['laurinedenis51@gmail,com', 'laurinedenis51@gmail.com'],
    ['thlesellier@@laposte.net', 'thlesellier@laposte.net'], // @ dédoublé
    ['françoisepayet16@gmail.com', 'francoisepayet16@gmail.com'], // accents translittérés
    ['joélruthjoél@yahoo.fr', 'joelruthjoel@yahoo.fr'],
    // la translittération rend l'adresse syntaxiquement valide ; le domaine
    // (typo probable de laposte.net) n'est pas du ressort de la validation
    ['desirécarlos@lapoace.net', 'desirecarlos@lapoace.net'],
    ['sœur.paul@hotmail.fr\nsoeur.paul@foyer.fr', 'soeur.paul@hotmail.fr'], // ligature œ
    ['delyeveline@gmailcom', 'delyeveline@gmail.com'], // point de domaine manquant
    ['dmouctar461@gmailcom', 'dmouctar461@gmail.com'],
    ['p.ingouff@gmail', 'p.ingouff@gmail.com'], // TLD manquant (fournisseur non ambigu)
    ['y.colliard@vert-saint-denis.f', 'y.colliard@vert-saint-denis.fr'], // TLD tronqué .f
    ['chantval85gmail.com', 'chantval85@gmail.com'], // @ oublié devant un fournisseur
    ['guehobrigitteicloud.com', 'guehobrigitte@icloud.com'],
    ['valolioorange.fr', 'valolio@orange.fr'],
    ['krystynaasatrian99 @gmail.com', 'krystynaasatrian99@gmail.com'], // espace avant @
    ['lyse .brehaut@neuf.fr', 'lyse.brehaut@neuf.fr'],
    ['tovichra@yahoo fr', 'tovichra@yahoo.fr'], // espace à la place du point du TLD
    ['‭corser.cs@gmail.com‬', 'corser.cs@gmail.com'], // caractères invisibles
  ])('repairs %s to %s', (raw, expected) => {
    expect(repairEmail(raw)).toBe(expected)
  })

  it.each([
    '',
    'elsabethcuvellier', // pas de @ ni fournisseur connu
    'A créer', // texte égaré (vidé via emailAbsent, pas réparé)
    'Pas la bonne @ shem_terry@live.fr', // la note dit que l'adresse est fausse
    'delyeveline@hotmail', // TLD ambigu (.fr et .com coexistent)
  ])('returns null for the irrecoverable %s', (raw) => {
    expect(repairEmail(raw)).toBeNull()
  })
})

describe('emailAbsent', () => {
  it.each([
    'A créer',
    'a créer',
    "pas d'email",
    "pas d'adresse mail",
    "pas de mail pour l'instant",
  ])('detects the absence mention %s', (raw) => {
    expect(emailAbsent(raw)).toBe(true)
  })

  it.each(['', 'FB', '2etg gauche', 'chantval85gmail.com', 'marie@curie.fr'])(
    'leaves %s alone',
    (raw) => {
      expect(emailAbsent(raw)).toBe(false)
    },
  )
})
