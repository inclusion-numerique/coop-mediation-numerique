import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { CoopBreadcrumbs } from '@/libraries/ui/components'
import type { IdentiteDuProfil } from '../../../../ui/presenters/mon-profil.presenter'
import { CarteInformationsProConnect } from '../components/CarteInformationsProConnect'

const Section = ({ children }: { children: ReactNode }) =>
  children === null ? null : <section className="fr-mb-4v">{children}</section>

export const MonProfilPage = ({
  identite,
  sections,
}: {
  identite: IdentiteDuProfil
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
            className="ri-account-circle-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
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
        <Section>{sections.contrats}</Section>
        <Section>{sections.mediation}</Section>
        <Section>{sections.suppression}</Section>
      </main>
    </div>
  </>
)
