import Button from '@codegouvfr/react-dsfr/Button'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services'
import { BackButton } from '@/libraries/ui/components'
import RdvServicePublicConnexionCard from '../components/RdvServicePublicConnexionCard'

const SeConnecterPage = ({ lienDeConnexion }: { lienDeConnexion: string }) => {
  return (
    <div className="fr-mb-32v">
      <div className="fr-mb-6v fr-mt-10v">
        <BackButton />
      </div>
      <RdvServicePublicConnexionCard title="Se connecter avec ProConnect">
        <div className="fr-flex fr-direction-column fr-align-items-center fr-text--center">
          <RDVServicePublicLogo
            className="fr-background-action-low--blue-france fr-border-radius--8 fr-p-3v"
            height={64}
            width={64}
            aria-hidden
          />
          <h1 className="fr-h3 fr-mb-2v fr-mt-6v fr-text-title--blue-france">
            Connectez-vous à RDV&nbsp;Service&nbsp;Public
          </h1>
          <p className="fr-text--xl fr-mb-12v fr-text-mention--grey">
            Avez-vous déjà un compte sur RDV&nbsp;Service&nbsp;Public&nbsp;?
          </p>
        </div>
        <div className="fr-btns-group">
          <Button
            linkProps={{
              href: lienDeConnexion,
            }}
          >
            J’ai déjà un compte
          </Button>
          <Button
            linkProps={{
              href: lienDeConnexion,
            }}
            priority="secondary"
            className="fr-mb-0"
          >
            Je n’ai pas de compte
          </Button>
        </div>
      </RdvServicePublicConnexionCard>
    </div>
  )
}

export default SeConnecterPage
