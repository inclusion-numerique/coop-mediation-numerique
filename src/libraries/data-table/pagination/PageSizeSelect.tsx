'use client'

import { useRouter } from 'next/navigation'
import type { FormEventHandler } from 'react'
import { routeConstruite } from '@/libraries/nextjs/route/route-construite'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import type { DataTableUrlState } from '../data-table-url-state'
import { createDataTableHref } from '../href/create-data-table-href'

export type PageSizeSelectProps = {
  className?: string
  baseHref: string
  state: DataTableUrlState
  pageSizeOptions: SelectOption[]
  defaultPageSize: number
}

export const PageSizeSelect = ({
  className,
  baseHref,
  state,
  pageSizeOptions,
  defaultPageSize,
}: PageSizeSelectProps) => {
  const router = useRouter()

  const onChange: FormEventHandler<HTMLSelectElement> = (event) => {
    const element = event.target as HTMLSelectElement | undefined
    if (!element) return

    router.push(
      routeConstruite(
        createDataTableHref(baseHref, {
          ...state,
          lignes: element.value,
          page: '1',
        }),
      ),
    )
  }

  return (
    <div className={className}>
      <select
        className="fr-select fr-select--white"
        defaultValue={state.lignes ?? defaultPageSize.toString(10)}
        onChange={onChange}
      >
        {pageSizeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
