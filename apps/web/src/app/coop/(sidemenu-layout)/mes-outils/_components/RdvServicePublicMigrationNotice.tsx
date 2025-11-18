import { getAuthenticatedSessionUser } from '@app/web/auth/getSessionUser'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'

const RdvServicePublicMigrationNotice = async () => {
  const user = await getAuthenticatedSessionUser()

  const hasRdvIntegration = user.rdvAccount?.hasOauthTokens

  // Do not display the notice if the user has a working integration with RDV Service Public
  if (hasRdvIntegration) {
    return null
  }

  return (
    <Notice
      className="fr-notice--flex fr-mb-6v fr-mt-2v"
      title={
        <span className="fr-text--sm fr-text--regular fr-text-default--grey">
          <span className="fr-text--bold fr-display-block">
            RDV Aide Numérique va progressivement migrer vers RDV Service Public
            afin de proposer un outil unique.
          </span>
          <span className="fr-display-block fr-text--sm fr-my-1v">
            Il est toujours possible d’utiliser{' '}
            <Link
              className="fr-link fr-text--sm"
              href="https://www.rdv-aide-numerique.fr/agents/sign_in"
              target="_blank"
            >
              RDV Aide Numérique
            </Link>{' '}
            et de retrouver votre historique, mais l’intégration avec La Coop
            sera disponible uniquement avec RDV Service Public. Pour en savoir
            plus, consultez le{' '}
            <Link
              className="fr-link fr-text--sm"
              href="https://betagouv.github.io/rdv-service-public/scenario_3cee8bd2b.html"
              target="_blank"
            >
              guide de migration
            </Link>
          </span>
        </span>
      }
    />
  )
}

export default RdvServicePublicMigrationNotice
