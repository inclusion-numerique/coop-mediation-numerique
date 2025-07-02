import { ComingSoon } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/[slug]/_components/ComingSoon'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import classNames from 'classnames'
import React from 'react'
import { OutilPageData } from '../outilPageData'
import { Access } from './_components/Access'
import { Features } from './_components/Features'
import { Hero } from './_components/Hero'

export const Outil = ({
  notice,
  noticeComponent,
  title,
  illustration,
  illustrationWidth,
  logo,
  description,
  website,
  websiteLinkLabel,
  features,
  access,
  accessComponent,
  more,
  classes,
}: OutilPageData) => (
  <CoopPageContainer size={894}>
    <CoopBreadcrumbs
      parents={[
        { label: 'Mes outils', linkProps: { href: '/coop/mes-outils' } },
      ]}
      currentPage={title}
    />
    <SkipLinksPortal />
    <main id={contentId}>
      <BackButton href="/coop/mes-outils">Retour</BackButton>
      {noticeComponent}
      {notice ? <ComingSoon text={notice} /> : null}
      <Hero
        title={title}
        illustration={illustration}
        illustrationWidth={illustrationWidth}
        logo={logo}
        description={description}
        website={website}
        websiteLinkLabel={websiteLinkLabel}
      />
      <section className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-xl-7 fr-col-12">
          <div className="fr-border fr-border-radius--8 fr-p-4w fr-height-full">
            {features != null && <Features features={features} />}
          </div>
        </div>
        <div className="fr-col-xl-5 fr-col-12">
          <div
            className={classNames(
              'fr-border fr-border-radius--8 fr-px-3w fr-py-4w fr-height-full',
              classes?.access,
            )}
          >
            {accessComponent || (access ? <Access {...access} /> : null)}
          </div>
        </div>
        {!!more && <div className=" fr-col-12">{more}</div>}
      </section>
    </main>
  </CoopPageContainer>
)
