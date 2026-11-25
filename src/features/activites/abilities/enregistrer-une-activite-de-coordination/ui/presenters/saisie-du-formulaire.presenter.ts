import type { CraAnimationData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-animation.validation'
import type { CraEvenementData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-evenement.validation'
import type { CraPartenariatData } from '@/features/activites/abilities/enregistrer-une-activite-de-coordination/ui/forms/cra-partenariat.validation'
import { minutesDeLaDuree } from '@/features/activites/ui/forms/saisie/duree.form-data'
import type { SaisieDUneActiviteDeCoordination } from '../../action/enregistrer-une-activite-de-coordination.validation'

type Saisie = SaisieDUneActiviteDeCoordination

const communDu = ({
  id,
  date,
  tags,
  notes,
}: {
  readonly id?: string | null | undefined
  readonly date: string
  readonly tags: readonly { readonly id: string }[]
  readonly notes?: string | null | undefined
}) => ({ id, date, tags: tags.map((tag) => tag.id), notes })

export const saisieDeLAnimation = (formulaire: CraAnimationData): Saisie => ({
  ...communDu(formulaire),
  type: 'Animation',
  duree: minutesDeLaDuree(formulaire.duree),
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
