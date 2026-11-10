import { minutesToCraDureeData } from '@app/web/features/activites/ui/saisie/duree'
import type { DefaultValues } from 'react-hook-form'
import type {
  Animation,
  Choix,
  ChoixMultiples,
  Evenement,
  Partenariat,
} from '../../../domain'
import type { CraAnimationData } from './animation/validation/CraAnimationValidation'
import type { CraEvenementData } from './evenement/validation/CraEvenementValidation'
import type { CraPartenariatData } from './partenariat/validation/CraPartenariatValidation'

const AUTRE = 'Autre' as const

const valeurDuChoix = <V extends string>(choix: Choix<V>): V | typeof AUTRE =>
  choix._tag === 'Autre' ? AUTRE : choix.valeur

const precisionDuChoix = <V>(choix: Choix<V>): string | undefined =>
  choix._tag === 'Autre' ? choix.precision : undefined

const valeursDesChoix = <V extends string>(
  choix: ChoixMultiples<V>,
): (V | typeof AUTRE)[] => [
  ...choix.valeurs,
  ...(choix.autre === null ? [] : [AUTRE]),
]

const communDe = (activite: Animation | Evenement | Partenariat) => ({
  id: activite.id,
  coordinateurId: activite.coordinateurId,
  date: activite.date,
  notes: activite.notes ?? undefined,
  tags: activite.tags.map(({ id, nom }) => ({ id, nom })),
})

export const formulaireDeLAnimation = (
  animation: Animation,
): DefaultValues<CraAnimationData> => ({
  ...communDe(animation),
  duree: minutesToCraDureeData(animation.duree) ?? {},
  typeAnimation: valeurDuChoix(animation.typeDAnimation),
  typeAnimationAutre: precisionDuChoix(animation.typeDAnimation),
  thematiquesAnimation: valeursDesChoix(animation.thematiques),
  thematiqueAnimationAutre: animation.thematiques.autre ?? undefined,
  initiative: animation.initiative ?? undefined,
  mediateurs: animation.intervenants.mediateurs,
  structures: animation.intervenants.structures,
  autresActeurs: animation.intervenants.autresActeurs,
})

export const formulaireDeLEvenement = (
  evenement: Evenement,
): DefaultValues<CraEvenementData> => ({
  ...communDe(evenement),
  nom: evenement.nom ?? undefined,
  participants: evenement.participants,
  typeEvenement: valeurDuChoix(evenement.typeDEvenement),
  typeEvenementAutre: precisionDuChoix(evenement.typeDEvenement),
  organisateurs: valeursDesChoix(evenement.organisateurs),
  organisateurAutre: evenement.organisateurs.autre ?? undefined,
  echelonTerritorial: evenement.echelon ?? undefined,
})

export const formulaireDuPartenariat = (
  partenariat: Partenariat,
): DefaultValues<CraPartenariatData> => ({
  ...communDe(partenariat),
  nom: partenariat.nom ?? undefined,
  naturePartenariat: valeursDesChoix(partenariat.natures),
  naturePartenariatAutre: partenariat.natures.autre ?? undefined,
  echelonTerritorial: partenariat.echelon ?? undefined,
  structuresPartenaires: partenariat.structuresPartenaires.map(
    ({ nom, type }) => ({
      nom,
      type: valeurDuChoix(type),
      typeAutre: precisionDuChoix(type),
    }),
  ),
})
