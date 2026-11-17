import { Spinner } from '@app/web/ui/Spinner'

export const GraphiqueEnAttente = () => (
  <div className="fr-col fr-border fr-pt-6v fr-pb-4v fr-px-8v fr-border-radius--16 fr-flex fr-direction-column">
    <div className="fr-mb-3w fr-py-1v">
      <h3 className="fr-text--lg fr-mb-0">Nombre d'accompagnements</h3>
    </div>
    <div className="fr-flex-grow-1 zone-du-graphique fr-flex fr-justify-content-center fr-align-items-center">
      <Spinner />
    </div>
  </div>
)
