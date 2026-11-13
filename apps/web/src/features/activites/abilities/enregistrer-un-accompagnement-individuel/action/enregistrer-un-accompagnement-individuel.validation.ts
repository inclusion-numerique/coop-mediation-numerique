import { z } from 'zod'
import {
  CommuneSaisie,
  communDeLaSaisie,
  communeSaisie,
  saisieDeMediation,
} from '../../../action/saisie-de-mediation'
import {
  Autonomie,
  BeneficiaireId,
  Genre,
  type Orientation,
  StatutSocial,
  StructureDeRedirection,
  TrancheDAge,
} from '../../../domain'
import type { SaisieIndividuelle } from '../domain'

const orientationSaisie = (
  orienteVersStructure: boolean | null | undefined,
  vers: StructureDeRedirection | null | undefined,
): Orientation => {
  if (orienteVersStructure === true) {
    return { _tag: 'Oriente', vers: vers ?? null }
  }
  return orienteVersStructure === false
    ? { _tag: 'NonOriente' }
    : { _tag: 'NonRenseignee' }
}

export const EnregistrerUnAccompagnementIndividuelValidation = z
  .object({
    ...saisieDeMediation,
    beneficiaire: z
      .object({
        id: z.guid().nullish(),
        dejaAccompagne: z.boolean().nullish(),
        genre: Genre.schema.nullish(),
        trancheAge: TrancheDAge.schema.nullish(),
        statutSocial: StatutSocial.schema.nullish(),
        communeResidence: CommuneSaisie.nullish(),
      })
      .nullish(),
    autonomie: Autonomie.schema.nullish(),
    orienteVersStructure: z.boolean().nullish(),
    structureDeRedirection: StructureDeRedirection.schema.nullish(),
  })
  .transform((saisie, contexte): SaisieIndividuelle => {
    const commun = communDeLaSaisie(saisie, contexte)
    if (commun === null) return z.NEVER
    const beneficiaire = saisie.beneficiaire
    return {
      ...commun,
      beneficiaire: {
        id: beneficiaire?.id == null ? null : BeneficiaireId(beneficiaire.id),
        dejaAccompagne: beneficiaire?.dejaAccompagne ?? false,
        profil: {
          genre: beneficiaire?.genre ?? Genre('NonCommunique'),
          trancheDAge: beneficiaire?.trancheAge ?? TrancheDAge('NonCommunique'),
          statutSocial:
            beneficiaire?.statutSocial ?? StatutSocial('NonCommunique'),
          residence: communeSaisie(beneficiaire?.communeResidence),
        },
      },
      autonomie: saisie.autonomie ?? null,
      orientation: orientationSaisie(
        saisie.orienteVersStructure,
        saisie.structureDeRedirection,
      ),
    }
  })
