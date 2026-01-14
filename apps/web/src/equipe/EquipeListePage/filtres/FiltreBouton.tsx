'use client'

import type { FilterParam } from '@app/web/equipe/EquipeListePage/searchMediateursCoordonneBy'
import { resetPagination } from '@app/web/libs/filters/helpers'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'

const parseStatutParam = (param: string | null): FilterParam[] => {
  if (!param) return []
  return param.split(',').filter(Boolean) as FilterParam[]
}

const updateStatut = (params: URLSearchParams, statuts: FilterParam[]) => {
  if (statuts.length > 0) {
    params.set('statut', statuts.join(','))
  } else {
    params.delete('statut')
  }
}

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
  const currentStatuts = parseStatutParam(searchParams.get('statut'))
  const isActive = currentStatuts.includes(filterParam)

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString())

    const newStatuts = isActive
      ? currentStatuts.filter((s) => s !== filterParam)
      : [...currentStatuts, filterParam]

    updateStatut(params, newStatuts)
    resetPagination(params)

    router.replace(`?${params}`, { scroll: false })
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
