import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import IconInSquare from '@app/web/components/IconInSquare'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { contentId } from '@app/web/utils/skipLinks'
import Link from 'next/link'
import type { PropsWithChildren } from 'react'

const ArchivesV1Layout = ({ children }: PropsWithChildren) => (
  <div className="fr-container fr-container--800 fr-pb-50v">
    <SkipLinksPortal />
    <CoopBreadcrumbs currentPage="Mes archives - Coop V.1" />
    <main id={contentId}>
      <div className="fr-flex fr-align-items-center fr-flex-gap-3v fr-my-12v">
        <IconInSquare iconId="fr-icon-archive-line" size="medium" />
        <h1 className="fr-mb-0 fr-text-title--blue-france">
          Mes archives&nbsp;-&nbsp;Coop V.1
        </h1>
      </div>
      <div className="fr-border-radius--8 fr-py-8v fr-px-10v fr-background-alt--blue-france fr-flex fr-align-items-center fr-flex-gap-10v fr-my-12v">
        <img
          src="/images/services/conseillers-numerique-logo.svg"
          alt="Logo Conseillers Numériques"
        />
        <div>
          <p className="fr-text--bold fr-mb-2v">
            Retrouvez l’historique de vos comptes rendus d’activité (CRA) et vos
            statistiques de la version précédente de l’espace Coop.
          </p>
          <p className="fr-text--sm fr-mb-2v">
            Les comptes rendus d’activité ainsi que les statistiques ont évolué
            avec cette nouvelle version. Vos données enregistrées sur la version
            précédente sont archivées sur cette page et disponibles sous forme
            d’exports.
          </p>
          <p className="fr-text--xs fr-mb-0 fr-text-mention--grey">
            Source&nbsp;:{' '}
            <Link href="https://conseiller-numerique.gouv.fr" target="_blank">
              conseiller-numerique.gouv.fr
            </Link>
          </p>
        </div>
      </div>
      {children}
    </main>
  </div>
)

export default ArchivesV1Layout
