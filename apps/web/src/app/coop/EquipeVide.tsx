import MonEquipeHeader from '@app/web/app/coop/(sidemenu-layout)/(accueil-coop)/_components/MonEquipeHeader'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

const EquipeVide = ({ withHeader = false }: { withHeader?: boolean }) => (
  <>
    {withHeader && <MonEquipeHeader />}
    <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8 fr-mb-4w">
      <span className="fr-text--bold fr-text--xl">
        Actuellement, vous n’avez aucun membre dans votre équipe.
      </span>
      <p className="fr-mb-8v">
        Invitez les médiateurs et médiatrices numériques que vous souhaitez
        coordonnez à rejoindre votre équipe.{' '}
        <a
          href="https://docs.numerique.gouv.fr/docs/0a862dcc-9cd1-4d5d-a713-571cc5aa5197/"
          className="fr-link fr-link--sm"
          target="_blank"
        >
          En savoir plus
        </a>
      </p>
      <Button
        linkProps={{
          href: '/coop/mon-equipe/inviter',
        }}
        iconId="fr-icon-user-add-line"
      >
        Inviter des membres
      </Button>
    </div>
  </>
)

export default EquipeVide
