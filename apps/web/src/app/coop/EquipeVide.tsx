import MonEquipeHeader from '@app/web/app/coop/(sidemenu-layout)/(accueil-coop)/_components/MonEquipeHeader'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'

const EquipeVide = ({ withHeader = false }: { withHeader?: boolean }) => (
  <>
    {withHeader && <MonEquipeHeader />}
    <div className="fr-text--center fr-background-alt--blue-france fr-p-12v fr-border-radius--8 fr-mb-4w">
      <p className="fr-text--bold fr-text--xl fr-mb-1v">
        Actuellement, vous n’avez aucun membre dans votre équipe.
      </p>
      <p className="fr-mb-8v">
        Invitez les médiateurs et médiatrices numériques que vous souhaitez
        coordonnez à rejoindre votre équipe.
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
