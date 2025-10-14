import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import { TagList } from '../list/TagList'
import { TagScope } from '../tagScope'
import { CounterCard } from './CounterCard'

export const AdministrationTagsPage = async ({
  tagsCreators,
  tagsUsedInCRAs,
  mostUsedTags,
}: {
  tagsCreators: {
    total: number
    percentage: number
  }
  tagsUsedInCRAs: {
    total: number
    percentage: number
  }
  mostUsedTags: {
    id: string
    nom: string
    scope: TagScope
    usageCount: number
    description?: string
  }[]
}) => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs
      parents={[
        {
          label: 'Fonctionnalités',
          linkProps: { href: `/administration/fonctionnalites` },
        },
      ]}
      currentPage="Tags"
    />
    <main id={contentId}>
      <AdministrationTitle icon="ri-calendar-check-line">
        Tags
      </AdministrationTitle>
      <div className="fr-my-16v">
        <section className="fr-mb-12v">
          <h2 className="fr-h5">
            Utilisateurs ayant créé des tags utilisés au moins 1 fois dans un
            CRA
          </h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-user-line">
                {numberToString(tagsCreators.total)}
              </CounterCard>
            </div>
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-percent-line">
                {numberToString(tagsCreators.percentage)}
              </CounterCard>
            </div>
          </div>
        </section>
        <section className="fr-mb-12v">
          <h2 className="fr-h5">CRA complétés avec au moins 1 tag</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-service-line">
                {numberToString(tagsUsedInCRAs.total)}
              </CounterCard>
            </div>
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-percent-line">
                {numberToString(tagsUsedInCRAs.percentage)}
              </CounterCard>
            </div>
          </div>
        </section>
        <section className="fr-mb-12v">
          <h2 className="fr-h5">
            Les {numberToString(mostUsedTags.length)} tags les plus utilisés
          </h2>
          <TagList tags={mostUsedTags} />
        </section>
      </div>
    </main>
  </CoopPageContainer>
)
