import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
import { getUserDisplayName } from '@app/web/utils/user'
import { notFound } from 'next/navigation'
import { MergeWithUser } from './MergeWithUser'

export const metadata = {
  title: metadataTitle('Utilisateurs - Fusion'),
}

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params

  const user = await prismaClient.user.findUnique({
    where: { id },
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
        currentPage="Fusionner"
        parents={[
          {
            label: 'Utilisateurs',
            linkProps: { href: '/administration/utilisateurs' },
          },
          {
            label: name,
            linkProps: { href: `/administration/utilisateurs/${id}` },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-git-merge-line">
          Fusionner {name} avec un autre utilisateur
        </AdministrationTitle>
        <MergeWithUser userId={id} />
      </main>
    </CoopPageContainer>
  )
}

export default Page
