import type { DefaultValues } from '@/libraries/formulaire'
import type {
  AccompagnementIndividuel,
  AffichageDeLActivite,
  BeneficiaireAccompagne,
  Orientation,
} from '../../../../domain'
import {
  communeDuFormulaire,
  formulaireCommunDeMediation,
} from '../../../../ui/presenters/saisie/formulaire-de-mediation.presenter'
import { suiviDuFormulaire } from '../../../../ui/presenters/saisie/suivi-du-formulaire.presenter'
import type { CraIndividuelData } from '../forms/cra-individuel.validation'

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
