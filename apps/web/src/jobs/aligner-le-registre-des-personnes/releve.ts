import {
  type ApercuDeLaSynchronisation,
  aUneAutreSource,
} from '@app/web/libraries/registre-personne'

const DUREE_D_INACTIVITE_EN_MS = 365 * 24 * 60 * 60 * 1000

const A_CORRIGER = 'à corriger'

export type CompteAuReleve = {
  readonly id: string
  readonly deleted: Date | null
  readonly lastLogin: Date | null
  readonly mediateur: {
    readonly id: string
    readonly isVisible: boolean
    readonly aUnLieuActif: boolean
  } | null
}

export type Signalements = {
  readonly courrielDUnAutreCompte: boolean
  readonly nomSansRapport: boolean
}

export const COLONNES_DU_RELEVE = [
  'compte_id',
  'personne_id',
  'lien',
  'nom',
  'prenom',
  'courriel',
  'telephone',
  'is_mediateur',
  'is_coordinateur',
  'is_visible',
  'suppression',
  'carte',
  'a_traiter_a_la_main',
] as const

export type LigneDuReleve = Readonly<
  Record<(typeof COLONNES_DU_RELEVE)[number], string>
>

const LIBELLES_DU_LIEN = {
  reliee: '',
  'a-creer': 'ligne à créer',
  'a-lier': 'ligne à lier',
  occupee: 'ligne à créer : courriel sur la ligne d’un autre compte vivant',
} as const

export const estAMasquer = (
  compte: CompteAuReleve,
  lien: ApercuDeLaSynchronisation['lien'],
  maintenant: Date,
): boolean =>
  lien !== 'reliee' &&
  compte.deleted === null &&
  compte.mediateur?.isVisible === true &&
  (compte.lastLogin === null ||
    maintenant.getTime() - compte.lastLogin.getTime() >
      DUREE_D_INACTIVITE_EN_MS)

export const estEnAttenteDArbitrage = (
  compte: CompteAuReleve,
  apercu: ApercuDeLaSynchronisation,
): boolean => compte.deleted !== null && aUneAutreSource(apercu.ligne)

const contactCoopDe = (contact: unknown): Record<string, unknown> => {
  if (typeof contact !== 'object' || contact === null) return {}
  if (!('coop' in contact)) return {}
  const { coop } = contact
  return typeof coop === 'object' && coop !== null ? { ...coop } : {}
}

const celluleDuCourriel = (
  apercu: ApercuDeLaSynchronisation,
  actuel: Record<string, unknown>,
  voulu: Record<string, unknown>,
): string =>
  apercu.alignement?.contact !== undefined && actuel.email !== voulu.email
    ? A_CORRIGER
    : ''

const celluleDuTelephone = (
  apercu: ApercuDeLaSynchronisation,
  actuel: Record<string, unknown>,
  voulu: Record<string, unknown>,
): string => {
  if (apercu.alignement?.contact === undefined) return ''
  if (actuel.telephone === voulu.telephone) return ''
  return voulu.telephone === undefined && typeof actuel.telephone === 'string'
    ? actuel.telephone
    : A_CORRIGER
}

const celluleSiEcrite = (
  apercu: ApercuDeLaSynchronisation,
  colonne: 'nom' | 'prenom' | 'isMediateur' | 'isCoordinateur' | 'isVisible',
): string =>
  apercu.alignement !== null && colonne in apercu.alignement ? A_CORRIGER : ''

const celluleDeLaSuppression = (
  compte: CompteAuReleve,
  apercu: ApercuDeLaSynchronisation,
): string => {
  if (estEnAttenteDArbitrage(compte, apercu)) return 'en attente d’arbitrage'
  return apercu.alignement !== null &&
    ('deletedAt' in apercu.alignement || 'deletedBy' in apercu.alignement)
    ? A_CORRIGER
    : ''
}

const celluleDeLaCarte = (
  compte: CompteAuReleve,
  lien: ApercuDeLaSynchronisation['lien'],
  maintenant: Date,
): string => {
  if (estAMasquer(compte, lien, maintenant))
    return 'masqué : inactif depuis 1 an'
  return lien !== 'reliee' &&
    compte.mediateur?.isVisible === true &&
    compte.mediateur.aUnLieuActif
    ? 'apparaîtrait sur la carte'
    : ''
}

const celluleATraiter = (
  lien: ApercuDeLaSynchronisation['lien'],
  { courrielDUnAutreCompte, nomSansRapport }: Signalements,
): string =>
  [
    lien === 'occupee' ? 'comptes à fusionner ou à vérifier' : '',
    courrielDUnAutreCompte ? 'courriel d’un autre compte vivant' : '',
    nomSansRapport ? 'nom sans rapport avec le compte' : '',
  ]
    .filter((motif) => motif !== '')
    .join(' ; ')

export const ligneDuReleve = ({
  compte,
  apercu,
  signalements,
  maintenant,
}: {
  readonly compte: CompteAuReleve
  readonly apercu: ApercuDeLaSynchronisation
  readonly signalements: Signalements
  readonly maintenant: Date
}): LigneDuReleve => {
  const actuel = contactCoopDe(apercu.ligne.contact)
  const voulu = contactCoopDe(apercu.alignement?.contact)

  return {
    compte_id: compte.id,
    personne_id: apercu.personneId === null ? '' : apercu.personneId.toString(),
    lien: LIBELLES_DU_LIEN[apercu.lien],
    nom: celluleSiEcrite(apercu, 'nom'),
    prenom: celluleSiEcrite(apercu, 'prenom'),
    courriel: celluleDuCourriel(apercu, actuel, voulu),
    telephone: celluleDuTelephone(apercu, actuel, voulu),
    is_mediateur: celluleSiEcrite(apercu, 'isMediateur'),
    is_coordinateur: celluleSiEcrite(apercu, 'isCoordinateur'),
    is_visible: celluleSiEcrite(apercu, 'isVisible'),
    suppression: celluleDeLaSuppression(compte, apercu),
    carte: celluleDeLaCarte(compte, apercu.lien, maintenant),
    a_traiter_a_la_main: celluleATraiter(apercu.lien, signalements),
  }
}

export const aQuelqueChoseADire = (ligne: LigneDuReleve): boolean =>
  COLONNES_DU_RELEVE.filter(
    (colonne) => colonne !== 'compte_id' && colonne !== 'personne_id',
  ).some((colonne) => ligne[colonne] !== '')

export const comptesParColonne = (
  lignes: readonly LigneDuReleve[],
): Readonly<Record<string, number>> =>
  Object.fromEntries(
    COLONNES_DU_RELEVE.filter(
      (colonne) => colonne !== 'compte_id' && colonne !== 'personne_id',
    ).map((colonne) => [
      colonne,
      lignes.filter((ligne) => ligne[colonne] !== '').length,
    ]),
  )

const cellule = (valeur: string): string =>
  valeur === ''
    ? ''
    : `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

export const releveEnCsv = (lignes: readonly LigneDuReleve[]): string =>
  `${[
    COLONNES_DU_RELEVE.join(';'),
    ...lignes.map((ligne) =>
      COLONNES_DU_RELEVE.map((colonne) => cellule(ligne[colonne])).join(';'),
    ),
  ].join('\n')}\n`
