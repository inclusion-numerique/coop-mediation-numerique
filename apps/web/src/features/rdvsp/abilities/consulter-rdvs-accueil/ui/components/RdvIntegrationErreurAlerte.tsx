import {
  rdvOauthLinkAccountErrorCallbackPath,
  rdvOauthLinkAccountFlowUrl,
  rdvOauthLinkAccountSuccessCallbackPath,
} from '@app/web/features/rdvsp/oauth'
import Alert from '@codegouvfr/react-dsfr/Alert'
import Button from '@codegouvfr/react-dsfr/Button'

export const RdvIntegrationErreurAlerte = () => (
  <Alert
    severity="warning"
    title="Connexion à RDV Service Public expirée"
    description={
      <span className="fr-flex fr-direction-column fr-align-items-start fr-flex-gap-3v fr-mt-1v">
        Vos rendez-vous ne se synchronisent plus avec La Coop.
        <br />
        Reconnectez-vous avec votre compte RDV Service Public habituel pour
        rétablir la synchronisation.
        <Button
          size="small"
          linkProps={{
            href: rdvOauthLinkAccountFlowUrl({
              redirectToSuccess: rdvOauthLinkAccountSuccessCallbackPath,
              redirectToError: rdvOauthLinkAccountErrorCallbackPath,
            }),
          }}
        >
          Rétablir la synchronisation
        </Button>
      </span>
    }
  />
)
