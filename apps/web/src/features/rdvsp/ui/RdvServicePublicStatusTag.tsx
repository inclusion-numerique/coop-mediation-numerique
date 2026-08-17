import type { FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr'
import { Tag } from '@codegouvfr/react-dsfr/Tag'
import type { StatutIntegration } from '../domain/sante-compte'

/**
 * Une déconnexion voulue et une panne portent le même libellé — dans les deux
 * cas le compte n'est plus relié — mais pas la même couleur : le rouge dit qu'il
 * y a quelque chose à réparer.
 */
const apparences: Record<
  StatutIntegration,
  {
    libelle: string
    iconId: FrIconClassName | RiIconClassName
    className: string
  }
> = {
  connecte: {
    libelle: 'Compte connecté',
    iconId: 'fr-icon-check-line',
    className: 'fr-background-contrast--success fr-text-default--success',
  },
  deconnecte: {
    libelle: 'Compte déconnecté',
    iconId: 'fr-icon-close-line',
    className: 'fr-background-contrast--grey fr-text-mention--grey',
  },
  jamaisConnecte: {
    libelle: 'Compte déconnecté',
    iconId: 'fr-icon-close-line',
    className: 'fr-background-contrast--grey fr-text-mention--grey',
  },
  enPanne: {
    libelle: 'Compte déconnecté',
    iconId: 'fr-icon-close-line',
    className: 'fr-background-contrast--error fr-text-default--error',
  },
}

const RdvServicePublicStatusTag = ({
  status,
  small = false,
}: {
  status: StatutIntegration
  small?: boolean
}) => {
  const { libelle, iconId, className } = apparences[status]

  return (
    <Tag iconId={iconId} className={className} small={small}>
      {libelle}
    </Tag>
  )
}

export default RdvServicePublicStatusTag
