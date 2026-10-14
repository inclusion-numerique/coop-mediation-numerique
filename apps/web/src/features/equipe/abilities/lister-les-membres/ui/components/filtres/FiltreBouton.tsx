'use client'

import { resetPagination } from '@app/web/libs/filters/helpers'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { FiltreStatut } from '../../../../../domain/criteres-equipe'
import type { FilterParam } from './valeurs-de-filtre'

const parseStatutParam = (param: string | null): FilterParam[] =>
  (param ?? '').split(',').flatMap((valeur) => {
    const statut = FiltreStatut.schema.safeParse(valeur)
    return statut.success ? [statut.data] : []
  })

const updateStatut = (params: URLSearchParams, statuts: FilterParam[]) => {
  if (statuts.length > 0) params.set('statut', statuts.join(','))
  if (statuts.length === 0) params.delete('statut')
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
