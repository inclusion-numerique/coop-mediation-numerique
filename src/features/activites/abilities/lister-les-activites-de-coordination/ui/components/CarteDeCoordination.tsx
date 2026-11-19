'use client'

import ListCard from '@/features/activites/ui/carte/ListCard'
import { CalendarIcon } from '@/libraries/pictograms/digital/CalendarIcon'
import { EcosystemIcon } from '@/libraries/pictograms/digital/EcosystemIcon'
import { HumanCooperationIcon } from '@/libraries/pictograms/environment/HumanCooperationIcon'
import type { CarteDeCoordination as Carte } from '../liste-des-coordinations.presenter'
import { DetailDeCoordinationDynamicModal } from './DetailDeCoordinationModale'

const PICTOGRAMMES = {
  Animation: EcosystemIcon,
  Evenement: CalendarIcon,
  Partenariat: HumanCooperationIcon,
}

export const CarteDeCoordination = ({ carte }: { carte: Carte }) => {
  const ouvrir = DetailDeCoordinationDynamicModal.useOpen()

  return (
    <ListCard
      as="button"
      contentTop={[carte.titre, ...carte.infos].join(' · ')}
      contentBottom={carte.objets.join(' · ')}
      pictogram={PICTOGRAMMES[carte.type]}
      actions={
        <span className="fr-text--xs fr-mb-0">
          Enregistré le {carte.enregistreeLe}
        </span>
      }
      onClick={() => ouvrir(carte.detail)}
    />
  )
}
