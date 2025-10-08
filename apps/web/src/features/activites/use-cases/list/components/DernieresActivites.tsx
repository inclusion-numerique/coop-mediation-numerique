import { CreateCraModalDefinition } from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalDefinition'
import { ActiviteListItemWithTimezone } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { Button } from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import React from 'react'
import ActiviteCard from './ActiviteCard'

const ActiviteEmptyState = () => (
  <div className="fr-text--center fr-background-alt--blue-france fr-p-6w fr-border-radius--16">
    <p className="fr-text--bold fr-text--lg fr-mb-1w">
      Vous n’avez pas encore enregistré d’activité
    </p>
    <p className="fr-mb-4w">
      Vous pouvez enregistrer votre première activité en cliquant sur
      ‘Enregistrer une activité’.
    </p>
    <Button
      type="button"
      {...CreateCraModalDefinition.buttonProps}
      iconId="fr-icon-add-line"
    >
      Enregistrer une activité
    </Button>
  </div>
)

export const DernieresActivites = ({
  activites,
}: {
  activites: ActiviteListItemWithTimezone[]
}) => (
  <>
    <div className="fr-flex fr-flex-wrap fr-flex-gap-4v fr-align-items-center fr-justify-content-space-between fr-mb-3w">
      <h2 className="fr-h5 fr-text-mention--grey fr-mb-0">
        <span className="ri-service-line fr-mr-1w" aria-hidden />
        Mes 3 dernières activités enregistrées
      </h2>
      <Button
        priority="tertiary no outline"
        size="small"
        linkProps={{
          href: '/coop/mes-activites',
        }}
        iconId="fr-icon-arrow-right-line"
        iconPosition="right"
      >
        Voir toutes mes activités
      </Button>
    </div>

    {activites.length > 0 ? (
      activites.map((activite, index) => (
        <ActiviteCard
          key={activite.id}
          variant="with-beneficiaire"
          activite={activite}
          displayDateDay
          stacked
          firstOfStack={index === 0}
          lastOfStack={index === activites.length - 1}
        />
      ))
    ) : (
      <ActiviteEmptyState />
    )}
  </>
)
