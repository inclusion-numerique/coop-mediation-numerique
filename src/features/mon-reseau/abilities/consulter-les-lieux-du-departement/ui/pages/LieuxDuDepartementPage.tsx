import type { ReactNode } from 'react'
import type { Departement } from '@/libraries/departement'
import type { LiensDePagination } from '@/libraries/etat-d-url'
import { BarreDeFiltres } from '@/libraries/etat-d-url/filtres'
import { ChampDeRecherche, PiedDeListe } from '@/libraries/etat-d-url/liste'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { BackButton, CoopBreadcrumbs } from '@/libraries/ui/components'
import { FiltreDesCommunesDuReseau } from '../../../../ui/components/FiltreDesCommunesDuReseau'
import { paginationDuReseau } from '../../../../ui/filtres/reseau.filtre'
import type { BarreDuReseau } from '../../../../ui/presenters/barre-du-reseau.presenter'
import { filDArianeDuReseau } from '../../../../ui/presenters/fil-d-ariane.presenter'
import { type CriteresDesLieux, estFiltre } from '../../domain'
import { TriDesLieuxDuReseau } from '../components/TriDesLieuxDuReseau'
import { libelleDesResultats } from '../presenters/libelles-des-filtres.presenter'

type LieuxTrouves = {
  readonly totalItems: number
}

const LieuxDuDepartementPage = ({
  departement,
  criteres,
  lieux,
  barre,
  pages,
  listeDesLieux,
}: {
  departement: Departement
  criteres: CriteresDesLieux
  lieux: LieuxTrouves
  barre: BarreDuReseau
  pages: LiensDePagination
  listeDesLieux: ReactNode
}) => {
  const departementLabel = `${departement.nom} (${departement.code})`

  const breadcrumbLabel = 'Annuaire des lieux d’activités'

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium">
        <CoopBreadcrumbs
          currentPage={breadcrumbLabel}
          parents={filDArianeDuReseau(departement.code)}
        />
        <main id={contentId} className="fr-mb-16w fr-mt-8v">
          <BackButton />
          <div className="fr-flex fr-align-items-center fr-flex-gap-6v fr-mb-6v">
            <span
              className="ri-home-office-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <div>
              <h1 className="fr-page-title fr-m-0 fr-h2">
                Annuaire des lieux d’activités
              </h1>
              <p className="fr-text--xs fr-text--bold fr-text--uppercase fr-text-mention--grey fr-mb-0">
                {departementLabel}
              </p>
            </div>
          </div>

          <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-6v fr-mt-12v">
            <ChampDeRecherche
              placeholder="Nom du lieu, adresse ou SIRET..."
              className="fr-flex-grow-1"
            />
          </div>

          <BarreDeFiltres
            etiquettes={barre.etiquettes}
            sansFiltres={barre.sansFiltres}
          >
            <FiltreDesCommunesDuReseau {...barre.communes} />
          </BarreDeFiltres>

          <hr className="fr-separator-1px" />

          <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-my-6v">
            <h2 className="fr-text--bold fr-text--xs fr-text--uppercase fr-mb-0">
              {libelleDesResultats(lieux.totalItems, estFiltre(criteres))}
            </h2>
            <TriDesLieuxDuReseau />
          </div>

          <hr className="fr-separator-1px" />

          {listeDesLieux}

          <PiedDeListe
            className="fr-mt-12v"
            liens={pages}
            pagination={paginationDuReseau}
          />
        </main>
      </div>
    </>
  )
}

export default LieuxDuDepartementPage
