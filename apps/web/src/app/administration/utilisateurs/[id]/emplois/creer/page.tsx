import CreerEmployeStructureForm from '@app/web/app/administration/utilisateurs/[id]/emplois/creer/CreerEmployeStructureForm'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { getUserDisplayName } from '@app/web/utils/user'
import { notFound, redirect } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Utilisateurs - Ajouter une structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params

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

  return (
    <CoopPageContainer>
      <AdministrationBreadcrumbs
        currentPage="Ajouter"
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
      <AdministrationTitle icon="fr-icon-user-line">
        {name} - Ajouter une structure employeuse <span className="fr-mx-1v" />{' '}
      </AdministrationTitle>
      <CreerEmployeStructureForm user={user} />
    </CoopPageContainer>
  )
}

export default Page
