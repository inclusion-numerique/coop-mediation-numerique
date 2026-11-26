'use client'

import { useRouter } from 'next/navigation'
import type { DepartementDuReferentiel } from '@/libraries/departement'
import { ChoixDuDepartement } from '@/libraries/departement/composants'
import { hrefDuReseau } from '../../../../ui/presenters/liens.presenter'

const DepartementComboBox = ({
  defaultDepartement,
}: {
  defaultDepartement: DepartementDuReferentiel
}) => {
  const router = useRouter()

  return (
    <ChoixDuDepartement
      libelle="Département"
      indice="Le réseau du département choisi s’affiche"
      departement={defaultDepartement}
      onChoix={({ code }) => router.push(hrefDuReseau(code))}
    />
  )
}

export default DepartementComboBox
