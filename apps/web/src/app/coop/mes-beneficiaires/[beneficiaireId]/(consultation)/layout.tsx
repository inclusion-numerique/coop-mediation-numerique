import { notFound } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { getAuthenticatedMediateur } from '@app/web/auth/getAuthenticatedMediateur'
import { prismaClient } from '@app/web/prismaClient'
import ViewBeneficiaireLayout from '@app/web/app/coop/mes-beneficiaires/[beneficiaireId]/(consultation)/ViewBeneficiaireLayout'

const BeneficiaireLayout = async ({
  params: { beneficiaireId },
  children,
}: PropsWithChildren<{
  params: { beneficiaireId: string }
}>) => {
  const user = await getAuthenticatedMediateur()

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
    },
  })

  if (!beneficiaire) {
    notFound()
    return null
  }

  return (
    <ViewBeneficiaireLayout beneficiaire={beneficiaire}>
      {children}
    </ViewBeneficiaireLayout>
  )
}

export default BeneficiaireLayout
