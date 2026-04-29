import ViewBeneficiaireLayout from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/ViewBeneficiaireLayout'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { findDuplicatesForBeneficiaire } from '@app/web/features/beneficiaire/abilities/detecter-doublons/implementation'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
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

  const duplicates = await findDuplicatesForBeneficiaire({
    beneficiaire: {
      id: BeneficiaireId(beneficiaire.id),
      mediateurId: MediateurId(beneficiaire.mediateurId),
      nom: beneficiaire.nom ? Nom(beneficiaire.nom) : null,
      prenom: beneficiaire.prenom ? Prenom(beneficiaire.prenom) : null,
      telephone: beneficiaire.telephone
        ? Telephone(beneficiaire.telephone)
        : null,
      email: beneficiaire.email ? Email(beneficiaire.email) : null,
    },
    withConflictingFields: 'include',
    fuzzyMatching: true,
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
