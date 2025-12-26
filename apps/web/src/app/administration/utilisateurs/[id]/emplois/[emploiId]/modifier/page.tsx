import ModifierEmployeStructureForm from '@app/web/app/administration/utilisateurs/[id]/emplois/[emploiId]/modifier/ModifierEmployeStructureForm'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { StructureCardStructure } from '@app/web/components/structure/StructureCard'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { dateAsIsoDay } from '@app/web/utils/dateAsIsoDay'
import { contentId } from '@app/web/utils/skipLinks'
import { getUserDisplayName } from '@app/web/utils/user'
import { notFound, redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Utilisateurs - Modifier une structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  params: Promise<{ id: string; emploiId: string }>
}) => {
  const params = await props.params

  const { id, emploiId } = params

  const user = await prismaClient.user.findUnique({
    where: {
      id,
    },
    include: {
      mediateur: {
        include: {
          conseillerNumerique: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
    return null
  }

  const emploi = await prismaClient.employeStructure.findUnique({
    where: {
      id: emploiId,
      userId: user.id,
    },
    include: {
      structure: true,
    },
  })

  if (!emploi) {
    notFound()
    return null
  }

  const name = getUserDisplayName(user)

  const conseillerNumeriqueInfo = await findConseillerNumeriqueV1(
    user.mediateur?.conseillerNumerique?.id
      ? {
          id: user.mediateur.conseillerNumerique.id,
          includeDeleted: true,
        }
      : {
          email: user.email,
          includeDeleted: true,
        },
  )

  if (conseillerNumeriqueInfo) {
    redirect(`/administration/utilisateurs/${user.id}/emplois`)
    return null
  }

  const structure: StructureCardStructure = {
    nom: emploi.structure.nom,
    adresse: emploi.structure.adresse,
    siret: emploi.structure.siret,
    codePostal: emploi.structure.codePostal,
    commune: emploi.structure.commune,
    typologies: emploi.structure.typologies,
    rna: emploi.structure.rna,
  }

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage="Modifier"
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
          {
            label: name,
            linkProps: { href: `/administration/utilisateurs/${id}` },
          },
          {
            label: 'Structure employeuse',
            linkProps: { href: `/administration/utilisateurs/${id}/emplois` },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-user-line">
          {name} - Modifier une structure employeuse{' '}
          <span className="fr-mx-1v" />{' '}
        </AdministrationTitle>
        <ModifierEmployeStructureForm
          user={user}
          structure={structure}
          defaultValues={{
            id: emploi.id,
            debut: dateAsIsoDay(emploi.debut),
            fin: emploi.fin ? dateAsIsoDay(emploi.fin) : undefined,
          }}
        />
      </main>
    </CoopPageContainer>
  )
}

export default Page
