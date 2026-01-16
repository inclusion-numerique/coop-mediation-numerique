'use client'

import { FiltreBouton } from './FiltreBouton'

export const Actifs = ({ count }: { count: number }) => (
  <FiltreBouton filterParam="actifs" count={count}>
    Actifs
  </FiltreBouton>
)
