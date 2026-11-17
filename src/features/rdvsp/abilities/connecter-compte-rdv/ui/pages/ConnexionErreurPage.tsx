import IconInSquare from '@app/web/components/IconInSquare'
import { rdvSupportEmail } from '@app/web/features/rdvsp/urls'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import RdvServicePublicConnexionCard from '../components/RdvServicePublicConnexionCard'

// add params error_description and error from next query
const ConnexionErreurPage = () => (
  //   {}: {
  //   searchParams: { error?: string; error_description?: string }
  // }
  <div className="fr-mb-32v fr-mt-10v">
    <RdvServicePublicConnexionCard
      header={false}
      title="Créer son compte avec ProConnect"
    >
      <div className="fr-grid-row fr-grid-row--center">
        <IconInSquare
          iconId="fr-icon-error-fill"
          size="medium"
          className="fr-background-contrast--error"
          classes={{
            icon: 'fr-text-default--error',
          }}
        />
      </div>
      <div className="fr-text--center">
        <h1 className="fr-mt-6v fr-h2 fr-text-title--blue-france fr-mb-4v">
          Erreur lors de la connexion
        </h1>
        <p className="fr-text-mention--grey fr-mb-6v">
          Contactez le support ou réessayer plus tard de connecter
          RDV&nbsp;Service&nbsp;Public à La&nbsp;Coop.
        </p>
        <Link
          href={`mailto:${rdvSupportEmail}?subject=Erreur lors de la connexion à La Coop de la médiation numérique`}
          className="fr-link fr-text--center"
        >
          <span className="fr-icon-mail-line fr-icon--sm" aria-hidden />{' '}
          Contacter le support de RDV&nbsp;Service&nbsp;Public
        </Link>
      </div>
      <div className="fr-btns-group fr-mt-8v">
        <Button
          linkProps={{
            href: '/coop/mes-outils/rdv-service-public',
          }}
          className="fr-mb-0"
        >
          J’ai compris
        </Button>
      </div>
    </RdvServicePublicConnexionCard>
  </div>
)

export default ConnexionErreurPage
