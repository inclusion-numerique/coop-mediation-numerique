'use client'

import BackButton from '@app/web/components/BackButton'
import { useSearchParams } from 'next/navigation'

const BackButtonBeneficiaire = () => {
  const searchParams = useSearchParams()
  const retour = searchParams.get('retour')

  return <BackButton href={retour ?? '/coop/mes-beneficiaires'} />
}

export default BackButtonBeneficiaire
