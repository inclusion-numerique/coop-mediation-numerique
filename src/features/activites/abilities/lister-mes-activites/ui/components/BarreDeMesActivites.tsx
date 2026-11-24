import type { ReactNode } from 'react'
import { BarreDeFiltres } from '@/libraries/etat-d-url/filtres/BarreDeFiltres'
import { PeriodeEnPopover } from '@/libraries/etat-d-url/filtres/PeriodeEnPopover'
import { FiltreDuLieuDesActivites } from '../../../../ui/components/filtres/FiltreDuLieuDesActivites'
import { FiltreDuTypeDActivite } from '../../../../ui/components/filtres/FiltreDuTypeDActivite'
import { PlusDeFiltresDesActivites } from '../../../../ui/components/filtres/PlusDeFiltresDesActivites'
import type { BarreDeMesActivitesPresentee } from '../presenters/barre-de-mes-activites.presenter'

export const BarreDeMesActivites = ({
  barre,
  rendezVousFiltrables,
  exportDesAccompagnements,
}: {
  barre: BarreDeMesActivitesPresentee
  rendezVousFiltrables: boolean
  exportDesAccompagnements: ReactNode
}) => (
  <BarreDeFiltres
    etiquettes={barre.etiquettes}
    sansFiltres={barre.sansFiltres}
    actions={exportDesAccompagnements}
  >
    <PeriodeEnPopover debut={barre.periode.debut} fin={barre.periode.fin} />
    <FiltreDuLieuDesActivites
      suggestions={barre.lieux.suggestions}
      choisies={barre.lieux.choisies}
    />
    <FiltreDuTypeDActivite rendezVousFiltrables={rendezVousFiltrables} />
    <PlusDeFiltresDesActivites
      importsV1={barre.importsV1}
      employeuses={barre.employeuses}
      tags={barre.tags}
    />
  </BarreDeFiltres>
)
