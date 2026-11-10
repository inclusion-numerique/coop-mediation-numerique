import type { CraAnimationData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/animation/validation/CraAnimationValidation'
import type { CraEvenementData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/evenement/validation/CraEvenementValidation'
import type { CraPartenariatData } from '@app/web/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/partenariat/validation/CraPartenariatValidation'
import type { z } from 'zod'
import { craDureeDataToMinutes } from '../../../use-cases/cra/db/minutesToCraDuree'
import type { EnregistrerUneActiviteDeCoordinationValidation } from '../action/enregistrer-une-activite-de-coordination.validation'

type Saisie = z.input<typeof EnregistrerUneActiviteDeCoordinationValidation>

const communDu = ({
  id,
  date,
  tags,
  notes,
}: {
  readonly id?: string | null
  readonly date: string
  readonly tags: readonly { readonly id: string }[]
  readonly notes?: string | null
}) => ({ id, date, tags: tags.map((tag) => tag.id), notes })

export const saisieDeLAnimation = (formulaire: CraAnimationData): Saisie => ({
  ...communDu(formulaire),
  type: 'Animation',
  duree: craDureeDataToMinutes(formulaire.duree),
  typeAnimation: formulaire.typeAnimation,
  typeAnimationAutre: formulaire.typeAnimationAutre,
  thematiquesAnimation: formulaire.thematiquesAnimation,
  thematiqueAnimationAutre: formulaire.thematiqueAnimationAutre,
  initiative: formulaire.initiative,
  mediateurs: formulaire.mediateurs,
  structures: formulaire.structures,
  autresActeurs: formulaire.autresActeurs,
})

export const saisieDeLEvenement = (formulaire: CraEvenementData): Saisie => ({
  ...communDu(formulaire),
  type: 'Evenement',
  nom: formulaire.nom,
  participants: formulaire.participants,
  typeEvenement: formulaire.typeEvenement,
  typeEvenementAutre: formulaire.typeEvenementAutre,
  organisateurs: formulaire.organisateurs,
  organisateurAutre: formulaire.organisateurAutre,
  echelonTerritorial: formulaire.echelonTerritorial,
})

export const saisieDuPartenariat = (
  formulaire: CraPartenariatData,
): Saisie => ({
  ...communDu(formulaire),
  type: 'Partenariat',
  nom: formulaire.nom,
  naturePartenariat: formulaire.naturePartenariat,
  naturePartenariatAutre: formulaire.naturePartenariatAutre,
  echelonTerritorial: formulaire.echelonTerritorial,
  structuresPartenaires: formulaire.structuresPartenaires,
})
