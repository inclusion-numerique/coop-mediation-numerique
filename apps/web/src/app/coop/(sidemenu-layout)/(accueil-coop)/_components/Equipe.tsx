import { sPluriel } from '@app/ui/utils/pluriel/sPluriel'
import Badge from '@codegouvfr/react-dsfr/Badge'
import Button from '@codegouvfr/react-dsfr/Button'
import React from 'react'
import MonEquipeHeader from './MonEquipeHeader'

const EquipeCount = ({
  label,
  countLabel,
  invitations,
}: {
  label: string
  countLabel: string
  invitations: number
}) => (
  <div className="fr-background-alt--brown-caramel fr-border-radius--16 fr-p-6v fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-1 fr-flex-gap-3v">
    <div className="fr-flex fr-justify-content-space-between fr-direction-column">
      <div className="fr-text--lg fr-text--semi-bold fr-mb-2v">{label}</div>
      <div className="fr-text--sm fr-mb-0">{countLabel}</div>

      {!!invitations && (
        <Badge severity="info" noIcon className="fr-mt-2w" small>
          {invitations} invitation{sPluriel(invitations)} à rejoindre votre
          équipe toujours en attente
        </Badge>
      )}
    </div>
    <div>
      <Button
        priority="secondary"
        linkProps={{
          href: '/coop/mon-equipe',
        }}
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
      >
        Voir mon équipe
      </Button>
    </div>
  </div>
)

export const Equipe = ({
  mediateurs: { actifs, inactifs, total, invitations },
}: {
  mediateurs: {
    total: number
    actifs: number
    inactifs: number
    invitations: number
  }
}) => (
  <>
    <MonEquipeHeader />
    <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
      <EquipeCount
        label={`${total} Membres dans votre équipe`}
        countLabel={`dont ${actifs} actifs · ${inactifs} inactifs`}
        invitations={invitations}
      />
    </div>
  </>
)
