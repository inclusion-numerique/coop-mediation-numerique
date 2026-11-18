'use client'

import { FiltreBouton } from './FiltreBouton'

export const Archives = ({ count }: { count: number }) => (
  <FiltreBouton filterParam="archives" count={count}>
    Archivés
  </FiltreBouton>
)
