import ActivitesListeLayout from '@app/web/features/activites/use-cases/list/components/ActivitesListeLayout'
import type { ReactNode } from 'react'
import type { FiltreActif } from '../../../../ui/filtres-actifs-des-coordinations'
import { ActivitesDeCoordinationListe } from '../components/ActivitesDeCoordinationListe'
import { FiltreDePeriode } from '../components/FiltreDePeriode'
import { FiltreDeTags } from '../components/FiltreDeTags'
import { FiltreDeType } from '../components/FiltreDeType'
import { FiltresActifs } from '../components/FiltresActifs'
import type { ListeDesCoordinations } from '../liste-des-coordinations.presenter'
import type { OptionsDeFiltrePresentees } from '../options-de-filtre.presenter'

export const MesCoordinationsPage = ({
  sousTitre,
  options,
  filtresActifs,
  liste,
  filtre,
  pagination,
  exporter,
}: {
  sousTitre?: string
  options: OptionsDeFiltrePresentees
  filtresActifs: readonly FiltreActif[]
  liste: ListeDesCoordinations
  filtre: boolean
  pagination: { page?: string; lignes?: string }
  exporter: ReactNode
}) => (
  <ActivitesListeLayout
    vue="liste"
    href="/coop/mes-coordinations"
    empty
    subtitle={sousTitre}
  >
    <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-2v fr-mb-6v">
      <div className="fr-flex fr-align-items-center fr-flex-gap-2v">
        <FiltreDePeriode minDate={options.debut} maxDate={options.fin} />
        <FiltreDeType />
        <FiltreDeTags tagOptions={[...options.tags]} />
      </div>
      {exporter}
    </div>
    <FiltresActifs ignoreParams={['page', 'lignes']} filters={filtresActifs} />
    <ActivitesDeCoordinationListe
      liste={liste}
      filtre={filtre}
      pagination={pagination}
    />
  </ActivitesListeLayout>
)
