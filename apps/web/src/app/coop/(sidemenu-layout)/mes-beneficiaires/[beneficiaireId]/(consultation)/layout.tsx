import ViewBeneficiaireLayout from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/ViewBeneficiaireLayout'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { findDuplicateForBeneficiaire } from '@app/web/features/beneficiaires/db/findDuplicateForBeneficiaire'
import { prismaClient } from '@app/web/prismaClient'
import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'

const BeneficiaireLayout = async (
  props: PropsWithChildren<{
    params: Promise<{ beneficiaireId: string }>
  }>,
) => {
  const params = await props.params

  const { beneficiaireId } = params

  const { children } = props

  const user = await authenticateMediateur()

  const beneficiaire = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      mediateurId: user.mediateur.id,
      suppression: null,
    },
    select: {
      id: true,
      prenom: true,
      nom: true,
      email: true,
      anneeNaissance: true,
      mediateurId: true,
      rdvUserId: true,
      telephone: true,
    },
  })

  if (!beneficiaire) {
    notFound()
    return null
  }

  const duplicates = await findDuplicateForBeneficiaire({
    beneficiaire,
    withConflictingFields: 'include',
  })

  return (
    <ViewBeneficiaireLayout
      beneficiaire={beneficiaire}
      user={user}
      duplicates={duplicates}
    >
      {children}
    </ViewBeneficiaireLayout>
  )
}

export default BeneficiaireLayout
