'use client'

import type { ReactNode } from 'react'
import {
  BarreDeFiltres,
  ChoixEnPopover,
  FiltresEnPopover,
  PeriodeEnPopover,
} from '@/libraries/etat-d-url/filtres'
import { RechercheDesTags } from '../../../../ui/components/filtres/RechercheDesTags'
import { filtreDesTags } from '../../../../ui/filtres/activites.filtre'
import { filtreDuTypeDeCoordination } from '../../../../ui/filtres/coordinations.filtre'
import type { BarreDesCoordinationsPresentee } from '../presenters/barre-des-coordinations.presenter'

export const BarreDesCoordinations = ({
  barre,
  exporter,
}: {
  barre: BarreDesCoordinationsPresentee
  exporter: ReactNode
}) => (
  <BarreDeFiltres
    etiquettes={barre.etiquettes}
    sansFiltres={barre.sansFiltres}
    actions={exporter}
  >
    <PeriodeEnPopover debut={barre.periode.debut} fin={barre.periode.fin} />
    <ChoixEnPopover
      titre="Type"
      sections={[
        { filtre: filtreDuTypeDeCoordination, legende: 'Filtrer par :' },
      ]}
    />
    <FiltresEnPopover titre="Tags" filtres={[filtreDesTags]} largeur={384}>
      <RechercheDesTags
        suggestions={barre.tags.suggestions}
        choisies={barre.tags.choisies}
      />
    </FiltresEnPopover>
  </BarreDeFiltres>
)
