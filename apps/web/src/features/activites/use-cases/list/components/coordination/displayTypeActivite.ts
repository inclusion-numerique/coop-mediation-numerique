import { CalendarIcon } from '@app/web/features/pictograms/digital/CalendarIcon'
import { EcosystemIcon } from '@app/web/features/pictograms/digital/EcosystemIcon'
import { HumanCooperationIcon } from '@app/web/features/pictograms/environment/HumanCooperationIcon'
import { Pictogram } from '@app/web/features/pictograms/pictogram'

type TypeActiviteCoordination = 'Animation' | 'Evenement' | 'Partenariat'

export const displayTypeActivite: Record<
  TypeActiviteCoordination,
  {
    pictogram: Pictogram
    label: string
    fullText: string
  }
> = {
  Animation: {
    pictogram: EcosystemIcon,
    label: 'Animation',
    fullText: 'l’animation',
  },
  Evenement: {
    pictogram: CalendarIcon,
    label: 'Évènement',
    fullText: 'l’évènement',
  },
  Partenariat: {
    pictogram: HumanCooperationIcon,
    label: 'Partenariat',
    fullText: 'le partenariat',
  },
}
