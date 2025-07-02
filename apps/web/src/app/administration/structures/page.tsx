import AdministrationCheckSiret from '@app/web/app/administration/structures/AdministrationCheckSiret'
import AdministrationSearchStructure from '@app/web/app/administration/structures/AdministrationSearchStructure'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { metadataTitle } from '@app/web/app/metadataTitle'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { prismaClient } from '@app/web/prismaClient'
import { getServerUrl } from '@app/web/utils/baseUrl'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'

export const metadata = {
  title: metadataTitle('Structures'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  const structuresMeta = await prismaClient.structure.count()

  return (
    <CoopPageContainer>
      <SkipLinksPortal />
      <AdministrationBreadcrumbs currentPage="Structures" />
      <main id={contentId}>
        <AdministrationTitle icon="fr-icon-home-4-line">
          Structures cartographie nationale
        </AdministrationTitle>
        <p className="fr-text--sm">
          <b>{numberToString(structuresMeta)}</b> structures importées depuis
          data inclusion
          <br />
          Notre API de structures créées ou modifiées à destination de la carto
          et data-inclusion:{' '}
          <Link
            href={getServerUrl('/api/lieux-mediation-numerique')}
            target="_blank"
            className="fr-link fr-link--sm"
          >
            {getServerUrl('/api/lieux-mediation-numerique')}
          </Link>
        </p>
        <div className="fr-border-radius--16 fr-border  fr-py-6v fr-px-12v fr-mb-6v">
          <h2 className="fr-h6">
            Rechercher une structure cartographie nationale
          </h2>
          <AdministrationSearchStructure />
        </div>
        <div className="fr-border-radius--16 fr-border  fr-py-6v fr-px-12v fr-mb-6v">
          <h2 className="fr-h6">Vérifier un SIRET</h2>
          <AdministrationCheckSiret />
        </div>
      </main>
    </CoopPageContainer>
  )
}

export default Page
