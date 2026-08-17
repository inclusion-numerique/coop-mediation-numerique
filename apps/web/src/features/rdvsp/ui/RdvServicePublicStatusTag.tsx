import type { RdvOauthIntegrationStatus } from '@app/web/features/rdvsp/ui/rdv-integration-status'
import { Tag } from '@codegouvfr/react-dsfr/Tag'

const RdvServicePublicStatusTag = ({
  status,
  small = false,
}: {
  status: RdvOauthIntegrationStatus
  small?: boolean
}) => {
  if (status === 'error' || status === 'none') {
    return (
      <Tag
        iconId="fr-icon-close-line"
        className="fr-background-contrast--error fr-text-default--error"
        small={small}
      >
        Compte déconnecté
      </Tag>
    )
  }
  return (
    <Tag
      iconId="fr-icon-check-line"
      className="fr-background-contrast--success fr-text-default--success"
      small={small}
    >
      Compte connecté
    </Tag>
  )
}

export default RdvServicePublicStatusTag
