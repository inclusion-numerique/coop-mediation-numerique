import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { LieuActivitePageContent } from '@app/web/features/lieux-activite/components/LieuActivitePageContent'
import { getLieuActivitePageData } from '@app/web/features/lieux-activite/getLieuActivitePageData'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import { contentId } from '@app/web/utils/skipLinks'
import { toTitleCase } from '@app/web/utils/toTitleCase'
import Button from '@codegouvfr/react-dsfr/Button'
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

      <div className="fr-flex fr-flex-gap-lg-4v fr-direction-column fr-direction-lg-row fr-justify-content-space-between">
        <AdministrationBreadcrumbs
          parents={[
            {
              label: 'Structures',
              linkProps: { href: `/administration/structures` },
            },
          ]}
          currentPage={toTitleCase(data.structure.nom, { noUpper: true })}
        />
        <div>
          <Button
            iconId="fr-icon-git-merge-line"
            priority="tertiary"
            size="small"
            linkProps={{
              href: `/administration/structures/${params.structureId}/merge`,
            }}
          >
            Fusionner avec une autre structure
          </Button>
        </div>
      </div>

      <main
        id={contentId}
        className="fr-mt-12v fr-pb-20v fr-flex fr-justify-content-center"
      >
        <LieuActivitePageContent
          data={data}
          canRemoveMediateurFromLieu
          hideBreadcrumbs
        />{' '}
      </main>
    </>
  )
}

export default Page
