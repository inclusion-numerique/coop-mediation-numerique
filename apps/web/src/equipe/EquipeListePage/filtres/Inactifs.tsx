'use client'

import { FiltreBouton } from './FiltreBouton'

export const Inactifs = ({ count }: { count: number }) => (
  <FiltreBouton filterParam="inactifs" count={count}>
    Inactifs
  </FiltreBouton>
)
