import CreerEmployeStructureForm from '@app/web/app/administration/utilisateurs/[id]/emplois/creer/CreerEmployeStructureForm'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { findConseillerNumeriqueV1 } from '@app/web/external-apis/conseiller-numerique/searchConseillerNumeriqueV1'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
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
      mediateur: true,
    },
  })

  if (!user) {
    notFound()
    return null
  }

  const name = getUserDisplayName(user)

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
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
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-user-line">
          {name} - Ajouter une structure employeuse{' '}
          <span className="fr-mx-1v" />{' '}
        </AdministrationTitle>
        <p>
          Siret ProConnect : <b>{user.siret || '-'}</b>
        </p>
        <CreerEmployeStructureForm user={user} />
      </main>
    </CoopPageContainer>
  )
}

export default Page
