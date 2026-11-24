'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { requeteAvec } from '@/libraries/parametres-d-url'
import type { FilterParam } from '../../search-params/parametres-de-la-liste.search-params'
import {
  statutBascule,
  statutsChoisis,
} from '../../search-params/parametres-de-la-liste.search-params'

export const FiltreBouton = ({
  filterParam,
  count,
  children,
}: {
  filterParam: FilterParam
  count: number
  children: ReactNode
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatuts = statutsChoisis(searchParams)
  const isActive = currentStatuts.includes(filterParam)

  const handleClick = () => {
    router.replace(
      requeteAvec(searchParams, statutBascule(searchParams, filterParam)),
      { scroll: false },
    )
  }

  return (
    <Button
      type="button"
      className={classNames(
        'fr-border-radius--4',
        isActive && 'fr-background-alt--blue-france',
      )}
      priority={isActive ? 'secondary' : 'tertiary'}
      onClick={handleClick}
    >
      {children} · {count}
    </Button>
  )
}
