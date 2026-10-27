import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { TagList } from '@app/web/features/activites/use-cases/tags/list/TagList'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { numberToString } from '@app/web/utils/formatNumber'
import { contentId } from '@app/web/utils/skipLinks'
import type { UsageDesTags } from '../../domain'
import { CounterCard } from '../CounterCard'
import { tagsDeLaListe } from '../usage-des-tags.presenter'

export const UsageDesTagsPage = ({
  createursDeTagsUtilises,
  comptesRendusTagues,
  tagsLesPlusUtilises,
}: UsageDesTags) => (
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
      <AdministrationTitle icon="ri-price-tag-3-line">Tags</AdministrationTitle>
      <div className="fr-my-16v">
        <section className="fr-mb-12v">
          <h2 className="fr-h5">
            Utilisateurs ayant créé des tags utilisés au moins 1 fois dans un
            CRA
          </h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-user-line">
                {numberToString(createursDeTagsUtilises.effectif)}
              </CounterCard>
            </div>
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-percent-line">
                {numberToString(createursDeTagsUtilises.pourcentage)}
              </CounterCard>
            </div>
          </div>
        </section>
        <section className="fr-mb-12v">
          <h2 className="fr-h5">CRA complétés avec au moins 1 tag</h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-service-line">
                {numberToString(comptesRendusTagues.effectif)}
              </CounterCard>
            </div>
            <div className="fr-col-md-6 fr-col-12">
              <CounterCard icon="ri-percent-line">
                {numberToString(comptesRendusTagues.pourcentage)}
              </CounterCard>
            </div>
          </div>
        </section>
        <section className="fr-mb-12v">
          <h2 className="fr-h5">
            Les {numberToString(tagsLesPlusUtilises.length)} tags les plus
            utilisés
          </h2>
          <TagList tags={tagsDeLaListe(tagsLesPlusUtilises)} />
        </section>
      </div>
    </main>
  </CoopPageContainer>
)
