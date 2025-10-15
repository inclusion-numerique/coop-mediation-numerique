import { CreateCraModalDefinition } from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalDefinition'
import { ActiviteListItem } from '@app/web/features/activites/use-cases/list/db/activitesQueries'
import { Button } from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import React from 'react'
import ActiviteCard from './ActiviteCard'

const ActiviteEmptyState = () => (
  <div className="fr-text--center fr-background-alt--blue-france fr-p-6w fr-border-radius--16">
    <p className="fr-text--bold fr-text--lg fr-mb-1w">
      Vous n’avez pas encore enregistré d’activité de coordination
    </p>
    <p className="fr-mb-4w">
      Vous pouvez enregistrer votre première activité de coordination en
      cliquant sur ‘Enregistrer une activité’.
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

export const ActivitesCoordination = ({
  activites,
}: {
  activites: ActiviteListItem[]
}) => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey fr-mb-3w">
      <span className="ri-service-line fr-mr-1w" aria-hidden />
      Mes activités de coordination
    </h2>

    {activites.length > 0 ? (
      activites.map(() => <div>Todo</div>)
    ) : (
      <ActiviteEmptyState />
    )}
  </>
)
