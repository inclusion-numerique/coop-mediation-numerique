'use client'

import { useState } from 'react'
import {
  type DateRange,
  DateRangePicker,
} from '@/libraries/ui/primitives/calendar/DateRangePicker'
import { filtreDePeriode } from '../definition/filtre-de-periode'
import { jourLocal, jourUtc } from '../definition/jour'
import { useChampDeFiltre } from './conteneur-de-filtres'
import { useFiltre } from './use-filtre'

const plageLue = ({
  du,
  au,
}: {
  du: Date | null
  au: Date | null
}): DateRange | undefined =>
  du === null || au === null
    ? undefined
    : { from: jourLocal(du), to: jourLocal(au) }

export const PeriodeEnLigne = ({
  debut,
  fin,
}: {
  debut?: Date | undefined
  fin?: Date | undefined
}) => {
  const [lues, ecrire] = useFiltre(filtreDePeriode.parametres)
  const [plage, setPlage] = useState(plageLue(lues))

  useChampDeFiltre({
    valider: () =>
      plage?.from === undefined || plage.to === undefined
        ? undefined
        : ecrire({ du: jourUtc(plage.from), au: jourUtc(plage.to) }),
    effacer: () => ecrire({ du: null, au: null }),
  })

  return (
    <DateRangePicker
      value={plage}
      onChange={setPlage}
      minDate={debut}
      maxDate={fin}
    />
  )
}
