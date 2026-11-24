'use client'

import { filtreDePeriode } from './definition/filtre-de-periode'
import { FiltresEnPopover } from './FiltresEnPopover'
import { PeriodeEnLigne } from './PeriodeEnLigne'

export const PeriodeEnPopover = ({
  debut,
  fin,
}: {
  debut?: Date
  fin?: Date
}) => (
  <FiltresEnPopover
    titre="Période"
    filtres={[filtreDePeriode]}
    resume={(libelles) => libelles.join(', ')}
  >
    <PeriodeEnLigne debut={debut} fin={fin} />
  </FiltresEnPopover>
)
