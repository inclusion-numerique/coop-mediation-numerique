import { Tag } from '@codegouvfr/react-dsfr/Tag'
import type { RdvOauthIntegrationStatus } from './rdvIntegrationOauthStatus'

const RdvServicePublicStatusTag = ({
  status,
}: { status: RdvOauthIntegrationStatus }) => {
  if (status === 'error') {
    return (
      <Tag
        iconId="fr-icon-close-line"
        className="fr-background-contrast--error fr-text-default--error"
      >
        Compte déconnecté
      </Tag>
    )
  }
  return (
    <Tag
      iconId="fr-icon-check-line"
      className="fr-background-contrast--success fr-text-default--success"
    >
      Compte connecté
    </Tag>
  )
}

export default RdvServicePublicStatusTag
