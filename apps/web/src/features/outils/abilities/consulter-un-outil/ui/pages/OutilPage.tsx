import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import { Access } from '../components/Access'
import { ComingSoon } from '../components/ComingSoon'
import { Features } from '../components/Features'
import { Hero } from '../components/Hero'
import type { FicheOutil } from '../fiche-outil'

export type EmplacementsDeLaFiche = {
  readonly avis?: ReactNode
  readonly acces?: ReactNode
}

export const OutilPage = ({
  emplacements = {},
  notice,
  title,
  illustration,
  illustrationWidth,
  pictogram,
  description,
  website,
  websiteLinkLabel,
  features,
  access,
  more,
  classes,
}: FicheOutil & { emplacements?: EmplacementsDeLaFiche }) => (
  <CoopPageContainer size={56}>
    <CoopBreadcrumbs
      parents={[
        { label: 'Mes outils', linkProps: { href: '/coop/mes-outils' } },
      ]}
      currentPage={title}
    />
    <SkipLinksPortal />
    <main id={contentId}>
      <BackButton />
      {emplacements.avis}
      {notice ? <ComingSoon text={notice} /> : null}
      <Hero
        title={title}
        illustration={illustration}
        illustrationWidth={illustrationWidth}
        pictogram={pictogram}
        description={description}
        website={website}
        websiteLinkLabel={websiteLinkLabel}
      />
      <section className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-xl-7 fr-col-12">
          <div className="fr-border fr-border-radius--8 fr-p-10v fr-height-full">
            {features != null && <Features features={features} />}
          </div>
        </div>
        <div className="fr-col-xl-5 fr-col-12">
          <div
            className={classNames(
              'fr-border fr-border-radius--8 fr-height-full',
              { 'fr-px-3w fr-py-4w': !classes?.access?.includes('fr-p-0') },
              classes?.access,
            )}
          >
            {emplacements.acces ?? (access ? <Access {...access} /> : null)}
          </div>
        </div>
        {!!more && <div className=" fr-col-12">{more}</div>}
      </section>
    </main>
  </CoopPageContainer>
)
