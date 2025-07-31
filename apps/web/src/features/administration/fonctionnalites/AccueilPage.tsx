import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { FeatureCard } from '@app/web/features/administration/fonctionnalites/FeatureCard'
import AdministrationBreadcrumbs from '@app/web/libs/ui/administration/AdministrationBreadcrumbs'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'
import type { ButtonProps } from '@codegouvfr/react-dsfr/Button'

type Fonctionnalite = {
  title: string
  slug: string
  icon: ButtonProps.IconOnly['iconId']
}

const fonctionnalites: Fonctionnalite[] = [
  {
    title: 'Rendez-Vous Service Public',
    slug: 'rdvsp',
    icon: 'ri-calendar-check-line',
  },
  {
    title: 'Tags',
    slug: 'tags',
    icon: 'ri-price-tag-3-line',
  },
]

export const AccueilPage = async () => (
  <CoopPageContainer>
    <SkipLinksPortal />
    <AdministrationBreadcrumbs currentPage="Fonctionnalités" />
    <main id={contentId}>
      <AdministrationTitle icon="ri-list-check-3">
        Fonctionnalités
      </AdministrationTitle>
      <div className="fr-my-8w">
        <div className="fr-grid-row fr-grid-row--gutters">
          {fonctionnalites.map(({ title, slug, icon }) => (
            <div key={slug} className="fr-col-xl-6 fr-col-12">
              <FeatureCard
                icon={icon}
                title={title}
                href={`fonctionnalites/${slug}`}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  </CoopPageContainer>
)
