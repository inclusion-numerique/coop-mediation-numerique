import Button from '@codegouvfr/react-dsfr/Button'
import type { RepartitionPresentee } from '../repartition.presenter'
import { StatistiqueMateriel } from './StatistiqueMateriel'

export const MaterielsUtilises = ({
  materiels,
}: {
  materiels: RepartitionPresentee['materiels']
}) => (
  <>
    <div className="fr-col fr-flex fr-align-items-center fr-mb-8v">
      <h3 className="fr-text--md fr-mb-0">
        Matériel utilisé lors des accompagnements
      </h3>
      <Button
        className="fr-px-1v fr-ml-1v fr-no-print"
        title="Plus d’information à propos du matériel utilisé"
        priority="tertiary no outline"
        size="small"
        type="button"
        aria-describedby="tooltip-meteriel-utilise"
      >
        <span className="ri-information-line fr-text--lg" aria-hidden />
      </Button>
      <span
        className="fr-tooltip fr-placement"
        id="tooltip-meteriel-utilise"
        role="tooltip"
        aria-hidden
      >
        Matériel utilisé lors d’un accompagnement de médiation numérique. À
        noter&nbsp;: Plusieurs matériels ont pu être utilisés lors d’un même
        accompagnement.
      </span>
    </div>
    <div className="fr-flex fr-flex-wrap fr-justify-content-space-between fr-flex-gap-6v fr-px-4v">
      {materiels.map(({ value, label, count, proportion }) => (
        <StatistiqueMateriel
          key={value}
          value={value}
          label={label}
          count={count}
          proportion={proportion}
        />
      ))}
    </div>
  </>
)
