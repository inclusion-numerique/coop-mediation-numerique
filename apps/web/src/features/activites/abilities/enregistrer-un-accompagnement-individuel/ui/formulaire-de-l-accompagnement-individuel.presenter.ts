import type { DefaultValues } from '@app/web/libs/form/use-app-form'
import type {
  AccompagnementIndividuel,
  AffichageDeLActivite,
  BeneficiaireAccompagne,
  Orientation,
} from '../../../domain'
import { suiviDuFormulaire } from '../../../ui/saisie/beneficiaire/suivi-du-formulaire'
import {
  communeDuFormulaire,
  formulaireCommunDeMediation,
} from '../../../ui/saisie/formulaire-de-mediation.presenter'
import type { CraIndividuelData } from './validation/CraIndividuelValidation'

const orientationDuFormulaire = (orientation: Orientation) => {
  if (orientation._tag === 'Oriente') {
    return {
      orienteVersStructure: 'yes' as const,
      structureDeRedirection: orientation.vers ?? undefined,
    }
  }
  return {
    orienteVersStructure:
      orientation._tag === 'NonOriente' ? ('no' as const) : undefined,
    structureDeRedirection: undefined,
  }
}

const beneficiaireDuFormulaire = (
  beneficiaire: BeneficiaireAccompagne,
  affichage: AffichageDeLActivite,
) => {
  if (beneficiaire._tag === 'Anonyme') {
    const { profil } = beneficiaire
    return {
      dejaAccompagne: beneficiaire.dejaAccompagne,
      genre: profil.genre,
      trancheAge: profil.trancheDAge,
      statutSocial: profil.statutSocial,
      communeResidence:
        profil.residence === null
          ? undefined
          : communeDuFormulaire(profil.residence),
    }
  }
  const suivi = affichage.suivis.find(({ id }) => id === beneficiaire.id)
  return suivi === undefined
    ? { id: beneficiaire.id }
    : suiviDuFormulaire(suivi)
}

export const formulaireDeLAccompagnementIndividuel = (
  accompagnement: AccompagnementIndividuel,
  affichage: AffichageDeLActivite,
): DefaultValues<CraIndividuelData> => ({
  ...formulaireCommunDeMediation(accompagnement, affichage),
  beneficiaire: beneficiaireDuFormulaire(
    accompagnement.beneficiaire,
    affichage,
  ),
  autonomie: accompagnement.autonomie ?? undefined,
  ...orientationDuFormulaire(accompagnement.orientation),
})
