import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const nomsCharge = [
  'PortefeuilleBeneficiaires',
  'NotesAccompagnements',
  'EmpreinteRdv',
  'AppartenancesEquipe',
  'LieuxActivite',
  'PartageStatistiques',
  'ListesDeDiffusion',
] as const

/** Une charge d'effacement, nommée par son intention et non par sa table. */
export const NomCharge = defineModel(z.enum(nomsCharge).brand('NomCharge'))
export type NomCharge = Model.TypeOf<typeof NomCharge>

export const VolumeEfface = defineModel(
  z.number().int().min(0).brand('VolumeEfface'),
)
export type VolumeEfface = Model.TypeOf<typeof VolumeEfface>

export const CauseTechnique = defineModel(
  z.string().trim().min(1).max(500).brand('CauseTechnique'),
)
export type CauseTechnique = Model.TypeOf<typeof CauseTechnique>

export type ResultatCharge =
  | {
      readonly _tag: 'effacee'
      readonly charge: NomCharge
      readonly volume: VolumeEfface
    }
  | { readonly _tag: 'sansObjet'; readonly charge: NomCharge }
  | {
      readonly _tag: 'echouee'
      readonly charge: NomCharge
      readonly cause: CauseTechnique
    }

/**
 * L'effacement a-t-il abouti (DM-4) ?
 *
 * Axe DISTINCT du `Result` de l'ability : l'accès peut être coupé — donc la
 * suppression réussie du point de vue de la personne — alors qu'une charge
 * satellite a échoué et que la promesse d'effacement n'est pas encore tenue.
 * Les confondre ferait avaler l'un des deux ; les séparer permet de journaliser
 * le partiel et de le reprendre.
 */
export type ConstatEffacement =
  | { readonly _tag: 'complet'; readonly resultats: readonly ResultatCharge[] }
  | {
      readonly _tag: 'partiel'
      readonly resultats: readonly ResultatCharge[]
      readonly enEchec: readonly NomCharge[]
    }

export const constat = (
  resultats: readonly ResultatCharge[],
): ConstatEffacement => {
  const enEchec = resultats
    .filter((resultat) => resultat._tag === 'echouee')
    .map((resultat) => resultat.charge)

  return enEchec.length === 0
    ? { _tag: 'complet', resultats }
    : { _tag: 'partiel', resultats, enEchec }
}

export const estComplet = (constatEffacement: ConstatEffacement): boolean =>
  constatEffacement._tag === 'complet'
