'use client'

import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { resetPagination } from '@/libraries/filtres/helpers'

export const CaseDesAnciensRattachements = ({ coche }: { coche: boolean }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const basculer = (cochee: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    cochee ? params.set('historique', '1') : params.delete('historique')
    resetPagination(params)
    router.replace(`?${params}`, { scroll: false })
  }

  return (
    <Checkbox
      small
      className="fr-mb-0 fr-ml-2v fr-align-self-center"
      options={[
        {
          label: 'Inclure les anciennes employeuses, équipes et lieux',
          nativeInputProps: {
            checked: coche,
            onChange: (event) => basculer(event.target.checked),
          },
        },
      ]}
    />
  )
}
