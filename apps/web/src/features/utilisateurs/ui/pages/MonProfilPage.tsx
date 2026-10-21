import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import type { ReactNode } from 'react'
import { CarteInformationsProConnect } from '../CarteInformationsProConnect'

export const MonProfilPage = ({
  identite,
  sections,
}: {
  identite: {
    readonly nom: string | null
    readonly courriel: string
    readonly telephone: string | null
  }
  sections: {
    readonly contrats: ReactNode
    readonly mediation: ReactNode
    readonly suppression: ReactNode
  }
}) => (
  <>
    <SkipLinksPortal />
    <div className="fr-container fr-container--800 fr-pb-16w">
      <CoopBreadcrumbs currentPage="Mon profil" />
      <main id={contentId}>
        <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
          <span
            className="ri-account-circle-line ri-lg fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
            aria-hidden
          />
          <h1 className="fr-page-title fr-m-0">Mon profil</h1>
        </div>
        <section className="fr-mb-4v">
          <CarteInformationsProConnect
            name={identite.nom}
            email={identite.courriel}
            phone={identite.telephone}
          />
        </section>
        {sections.contrats}
        {sections.mediation}
        {sections.suppression}
      </main>
    </div>
  </>
)
