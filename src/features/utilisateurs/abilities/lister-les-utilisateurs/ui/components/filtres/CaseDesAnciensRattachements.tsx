'use client'

import Checkbox from '@codegouvfr/react-dsfr/Checkbox'
import { useRouter, useSearchParams } from 'next/navigation'
import { historiqueEnParametres } from '@/features/utilisateurs/abilities/lister-les-utilisateurs/ui/search-params/lister-les-utilisateurs.search-params'
import { requeteAvec } from '@/libraries/parametres-d-url'

export const CaseDesAnciensRattachements = ({ coche }: { coche: boolean }) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const basculer = (cochee: boolean) => {
    router.replace(requeteAvec(searchParams, historiqueEnParametres(cochee)), {
      scroll: false,
    })
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
