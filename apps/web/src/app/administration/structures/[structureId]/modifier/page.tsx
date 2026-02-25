import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import { contentId } from '@app/web/utils/skipLinks'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Modifier une structure'),
}

const Page = async (props: { params: Promise<{ structureId: string }> }) => {
  const params = await props.params
  const data = await getLieuActivitePageData({
    id: params.structureId,
  })

  if (!data) {
    return notFound()
  }

  return (
    <>
      <SkipLinksPortal />

      <AdministrationBreadcrumbs
        parents={[
          {
            label: 'Structures',
            linkProps: { href: `/administration/structures` },
          },
        ]}
        currentPage={toTitleCase(data.structure.nom, { noUpper: true })}
      />

      <main
        id={contentId}
        className="fr-mt-12v fr-pb-20v fr-flex fr-justify-content-center"
      >
        <LieuActivitePageContent
          data={data}
          canRemoveMediateurFromLieu
          hideBreadcrumbs
        />
      </main>
    </>
  )
}

export default Page
