import ViewBeneficiaireLayout from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/ViewBeneficiaireLayout'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
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
    },
  })

  if (!beneficiaire) {
    notFound()
    return null
  }

  return (
    <ViewBeneficiaireLayout beneficiaire={beneficiaire} user={user}>
      {children}
    </ViewBeneficiaireLayout>
  )
}

export default BeneficiaireLayout
