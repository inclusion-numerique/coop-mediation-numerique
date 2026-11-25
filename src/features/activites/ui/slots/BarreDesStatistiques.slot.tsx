import type { ReactNode } from 'react'
import {
  BarreDeFiltres,
  PeriodeEnPopover,
} from '@/libraries/etat-d-url/filtres'
import { FiltreDesMediateurs } from '../components/filtres/FiltreDesMediateurs'
import { FiltreDuLieuDesActivites } from '../components/filtres/FiltreDuLieuDesActivites'
import { FiltreDuTypeDActivite } from '../components/filtres/FiltreDuTypeDActivite'
import { PlusDeFiltresDesActivites } from '../components/filtres/PlusDeFiltresDesActivites'
import type { BarreDesStatistiquesPresentee } from '../presenters/barre-des-statistiques.presenter'

export const BarreDesStatistiques = ({
  barre,
  periode,
  coordinateur,
  importsV1,
  actions,
}: {
  barre: BarreDesStatistiquesPresentee
  periode: {
    readonly debut?: Date | undefined
    readonly fin?: Date | undefined
  }
  coordinateur: boolean
  importsV1: boolean
  actions: ReactNode
}) => (
  <BarreDeFiltres
    etiquettes={barre.etiquettes}
    sansFiltres={barre.sansFiltres}
    actions={actions}
  >
    {coordinateur && (
      <FiltreDesMediateurs
        suggestions={barre.mediateurs.suggestions}
        choisies={barre.mediateurs.choisies}
      />
    )}
    <PeriodeEnPopover debut={periode.debut} fin={periode.fin} />
    <FiltreDuLieuDesActivites
      suggestions={barre.lieux.suggestions}
      choisies={barre.lieux.choisies}
    />
    <FiltreDuTypeDActivite rendezVousFiltrables={false} />
    <PlusDeFiltresDesActivites
      importsV1={importsV1}
      avecDispositif={coordinateur}
      employeuses={barre.employeuses}
      tags={barre.tags}
    />
  </BarreDeFiltres>
)
