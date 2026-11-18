'use client'

import { SegmentedControl } from '@codegouvfr/react-dsfr/SegmentedControl'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ComponentProps, FormEvent } from 'react'

type ChampDeVue = ComponentProps<'input'> & Record<'data-vue', string>

export const ChoixDeLaVue = ({
  href,
  courante,
}: {
  href: string
  courante: 'liste' | 'tableau'
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onChange = ({ target }: FormEvent) => {
    if (!(target instanceof HTMLInputElement) || !target.checked) return
    router.push(
      target.dataset.vue === 'tableau'
        ? `${href}/tableau?${searchParams.toString()}`
        : `${href}?${searchParams.toString()}`,
    )
  }

  const liste: ChampDeVue = {
    defaultChecked: courante === 'liste',
    'data-vue': 'liste',
  }

  const tableau: ChampDeVue = {
    defaultChecked: courante === 'tableau',
    'data-vue': 'tableau',
  }

  return (
    <form onChange={onChange} key={courante}>
      <SegmentedControl
        name="vue"
        legend="Type de vue"
        hideLegend
        segments={[
          {
            iconId: 'fr-icon-list-unordered',
            label: 'Vue liste',
            nativeInputProps: liste,
          },
          {
            iconId: 'fr-icon-table-line',
            label: 'Vue tableau',
            nativeInputProps: tableau,
          },
        ]}
      />
    </form>
  )
}
