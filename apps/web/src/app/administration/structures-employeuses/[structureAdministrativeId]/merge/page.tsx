import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import MergeStructureAdministrative from '@app/web/features/structures/use-cases/merge/components/MergeStructureAdministrative'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { contentId } from '@app/web/utils/skipLinks'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Structures employeuses - Fusion'),
}

const Page = async (props: {
  params: Promise<{ structureAdministrativeId: string }>
}) => {
  const { structureAdministrativeId } = await props.params
  const source = await prismaClient.structureAdministrative.findUnique({
    where: { id: structureAdministrativeId },
    select: { id: true, nom: true },
  })
  if (!source) return notFound()

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs
        currentPage="Fusionner"
        parents={[
          {
            label: 'Structures employeuses',
            linkProps: { href: '/administration/structures-employeuses' },
          },
          {
            label: source.nom,
            linkProps: {
              href: `/administration/structures-employeuses/${source.id}`,
            },
          },
        ]}
      />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-git-merge-line">
          Fusionner {source.nom} avec une autre employeuse
        </AdministrationTitle>
        <MergeStructureAdministrative source={source} />
      </main>
    </CoopPageContainer>
  )
}

export default Page
