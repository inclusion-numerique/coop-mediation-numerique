import type { FrIconClassName, RiIconClassName } from '@codegouvfr/react-dsfr'
import { Tag } from '@codegouvfr/react-dsfr/Tag'
import type { StatutIntegration } from '../domain/sante-compte'

/**
 * Une déconnexion voulue et un compte jamais relié portent le même libellé : dans
 * les deux cas, rien n'est branché et il n'y a rien à réparer.
 *
 * La panne, elle, a son propre mot. L'appeler « déconnecté » disait faux — les
 * jetons sont là, le compte est relié, c'est le dernier échange qui a échoué — et
 * cela envoyait chercher une reconnexion là où il n'y avait qu'une synchro à
 * rejouer.
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
    libelle: 'Connexion à rétablir',
    iconId: 'fr-icon-error-warning-line',
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
