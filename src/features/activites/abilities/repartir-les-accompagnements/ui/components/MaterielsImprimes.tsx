import type { RepartitionPresentee } from '../repartition.presenter'
import { StatistiqueMateriel } from './StatistiqueMateriel'

export const MaterielsImprimes = ({
  materiels,
}: {
  materiels: RepartitionPresentee['materiels']
}) => (
  <>
    <h3 className="fr-h5 fr-mb-2v fr-mt-6v">
      Matériel utilisé lors des accompagnements
    </h3>
    <small role="note" className="fr-mb-6v fr-display-block">
      Matériel utilisé lors d’un accompagnement de médiation numérique. À
      noter&nbsp;: Plusieurs matériels ont pu être utilisés lors d’un même
      accompagnement.
    </small>
    <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
      {materiels.map(({ value, label, count, proportion }) => (
        <StatistiqueMateriel
          key={value}
          className="fr-col-2"
          value={value}
          label={label}
          count={count}
          proportion={proportion}
        />
      ))}
    </div>
  </>
)
