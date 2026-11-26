export type BilanModele = {
  readonly noop: number
  readonly created: number
  readonly updated: number
  readonly deleted: number
}

export type OperationSynchronisation = keyof BilanModele

export const bilanVide: BilanModele = {
  noop: 0,
  created: 0,
  updated: 0,
  deleted: 0,
}

export const cumulerBilans = (
  premier: BilanModele,
  second: BilanModele,
): BilanModele => ({
  noop: premier.noop + second.noop,
  created: premier.created + second.created,
  updated: premier.updated + second.updated,
  deleted: premier.deleted + second.deleted,
})

export type ModeleSynchronise =
  | 'rdvs'
  | 'organisations'
  | 'webhooks'
  | 'users'
  | 'motifs'
  | 'lieux'

const modelesSynchronises = [
  'rdvs',
  'organisations',
  'webhooks',
  'users',
  'motifs',
  'lieux',
] as const

export type BilanSynchronisation = Readonly<
  Record<ModeleSynchronise, BilanModele>
>

export const bilanSynchronisationVide: BilanSynchronisation = {
  rdvs: bilanVide,
  organisations: bilanVide,
  webhooks: bilanVide,
  users: bilanVide,
  motifs: bilanVide,
  lieux: bilanVide,
}

export const derive = (
  bilan: BilanModele,
  suppressionEstUnEcart: boolean,
): number =>
  bilan.created + bilan.updated + (suppressionEstUnEcart ? bilan.deleted : 0)

const suppressionEstUnEcart: Readonly<Record<ModeleSynchronise, boolean>> = {
  rdvs: true,
  organisations: true,
  webhooks: true,
  users: true,
  motifs: false,
  lieux: true,
}

export const deriveDuModele = (
  modele: ModeleSynchronise,
  bilan: BilanSynchronisation,
): number => derive(bilan[modele], suppressionEstUnEcart[modele])

export const deriveTotale = (bilan: BilanSynchronisation): number =>
  modelesSynchronises.reduce(
    (total, modele) => total + deriveDuModele(modele, bilan),
    0,
  )
