import { CreateCraModalDefinition } from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalDefinition'
import { Button } from '@codegouvfr/react-dsfr/Button'
import React from 'react'

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
  activites: {
    type: 'Animation' | 'Evenement' | 'Partenariat'
    count: number
  }[]
}) => (
  <>
    <h2 className="fr-h5 fr-text-mention--grey fr-mb-3w">
      <span className="ri-service-line fr-mr-1w" aria-hidden />
      Mes activités de coordination
    </h2>

    {activites.length > 0 ? (
      <div className="fr-flex fr-flex-gap-6v fr-direction-lg-row fr-direction-column">
        {activites.map(({ type, count }) => (
          <div
            key={type}
            className="fr-flex fr-flex-1 fr-direction-column fr-background-alt--blue-france fr-p-6v fr-border-radius--8"
          >
            <span className="fr-text--uppercase fr-text--xs fr-text--bold fr-mb-0 fr-text-default--grey">
              {type === 'Evenement' ? 'Évènement' : type}
            </span>
            <span className="fr-text--lg fr-text--bold fr-mb-0">{count}</span>
          </div>
        ))}
      </div>
    ) : (
      <ActiviteEmptyState />
    )}
  </>
)
