import { AccompagnementPieChart } from '@/features/activites/ui/components/AccompagnementPieChart'
import {
  couleursDesStatuts,
  genresColors,
  tranchesAgeColors,
} from '@/features/activites/ui/labels/couleurs.labels'
import ProgressBar from '@/libraries/proportions/ProgressBar'
import { QuantifiedShareLegend } from '@/libraries/proportions/QuantifiedShareLegend'
import type { ProfilPresente } from '../presenters/profil.presenter'

const toProgress = ({
  label,
  count,
  proportion,
}: {
  label: string
  count?: number
  proportion: number
}) => ({
  label,
  ...(count === undefined ? {} : { count }),
  percentage: proportion,
})

export const ProfilDesPersonnesAccompagnees = ({
  beneficiaires,
}: {
  beneficiaires: ProfilPresente
}) => (
  <>
    <div className="fr-grid-row fr-grid-row--gutters">
      <div className="fr-col-lg-6 fr-col-12">
        <h3 className="fr-text--md fr-text--nowrap fr-mb-4v">Genres</h3>
        <QuantifiedShareLegend
          quantifiedShares={beneficiaires.genres}
          colors={genresColors}
        />
      </div>
      <div className="fr-col-lg-6 fr-col-12">
        <AccompagnementPieChart
          size={225}
          width={52}
          className="fr-mx-auto"
          data={beneficiaires.genres}
          colors={genresColors}
          half
        />
      </div>
    </div>
    <hr className="fr-separator-1px fr-my-5w" />
    <div className="fr-flex fr-flex-wrap fr-flex-gap-12v">
      <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
        <h3 className="fr-text--md fr-text--nowrap fr-mb-4v">Tranches d'âge</h3>
        <div className="fr-mb-4v">
          <ProgressBar
            size="large"
            progress={beneficiaires.trancheAges.map(toProgress)}
            colors={tranchesAgeColors}
            tooltipKey="tranches-age"
          />
        </div>
        <QuantifiedShareLegend
          quantifiedShares={beneficiaires.trancheAges}
          colors={tranchesAgeColors}
        />
      </div>
      <div className="fr-flex-grow-1 fr-flex-basis-full fr-flex-basis-lg-0">
        <h3 className="fr-text--md fr-text--nowrap fr-mb-4v">Statuts</h3>
        <div className="fr-mb-4v">
          <ProgressBar
            size="large"
            progress={beneficiaires.statutsSocial.map(toProgress)}
            colors={couleursDesStatuts}
            tooltipKey="status-beneficiaires"
          />
        </div>
        <QuantifiedShareLegend
          quantifiedShares={beneficiaires.statutsSocial}
          colors={couleursDesStatuts}
        />
      </div>
    </div>
  </>
)
