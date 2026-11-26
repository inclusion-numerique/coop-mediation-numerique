import type {
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  ProfilNonChoisi,
} from '@/features/inscription/domain'

export type AdresseNonValidee = {
  readonly _tag: 'AdresseNonValidee'
  readonly nom: string
}

export const AdresseNonValidee = (nom: string): AdresseNonValidee => ({
  _tag: 'AdresseNonValidee',
  nom,
})

export type EchecDeRenseignerLieuxActivite =
  | InscriptionIntrouvable
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | AdresseNonValidee
