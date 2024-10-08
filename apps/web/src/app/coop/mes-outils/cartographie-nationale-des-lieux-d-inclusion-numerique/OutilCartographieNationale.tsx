import React from 'react'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId, defaultSkipLinks } from '@app/web/utils/skipLinks'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import HeaderBackLink from '@app/web/components/HeaderBackLink'
import { OutilPageData } from '../outilPageData'
import { Access } from '../[slug]/_components/Access'
import { Features } from '../[slug]/_components/Features'
import { Hero } from '../[slug]/_components/Hero'

export const OutilCartographieNationale = ({
  title,
  illustration,
  illustrationWidth,
  logo,
  description,
  website,
  features,
  access,
  nombreDeLieuxReferences,
  nombreDeLieuxTotal,
}: OutilPageData & {
  nombreDeLieuxReferences: number
  nombreDeLieuxTotal: number
}) => (
  <CoopPageContainer size={894} className="fr-pt-8v">
    <CoopBreadcrumbs
      parents={[
        { label: 'Mes outils', linkProps: { href: '/coop/mes-outils' } },
      ]}
      currentPage={title}
    />
    <HeaderBackLink className="fr-mb-3w" />
    <SkipLinksPortal links={defaultSkipLinks} />
    <main id={contentId}>
      <Hero
        title={title}
        illustration={illustration}
        illustrationWidth={illustrationWidth}
        logo={logo}
        description={description}
        website={website}
      />
      <section className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-xl-7 fr-col-12">
          <div className="fr-border fr-border-radius--8 fr-p-4w fr-height-full">
            {features != null && <Features features={features} />}
          </div>
        </div>
        <div className="fr-col-xl-5 fr-col-12">
          <div className="fr-border fr-border-radius--8 fr-px-3w fr-py-4w fr-height-full">
            {access && (
              <Access
                {...access}
                how={
                  <>
                    <strong>
                      {nombreDeLieuxReferences}/{nombreDeLieuxTotal}
                    </strong>{' '}
                    {access.how}
                  </>
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  </CoopPageContainer>
)
