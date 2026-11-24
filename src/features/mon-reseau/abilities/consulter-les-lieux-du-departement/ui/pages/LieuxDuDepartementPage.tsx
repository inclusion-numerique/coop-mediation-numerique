import type { ReactNode } from 'react'
import {
  DataSearchBar,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import SortSelect from '@/libraries/data-table/sort/SortSelect'
import type { Departement } from '@/libraries/departement'
import { BarreDeFiltres } from '@/libraries/etat-d-url/BarreDeFiltres'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import { LIGNES_PAR_DEFAUT } from '../../../../domain'
import { FiltreDesCommunesDuReseau } from '../../../../ui/components/FiltreDesCommunesDuReseau'
import type { BarreDuReseau } from '../../../../ui/presenters/barre-du-reseau.presenter'
import { filDArianeDuReseau } from '../../../../ui/presenters/fil-d-ariane.presenter'
import { hrefDesLieux } from '../../../../ui/presenters/liens.presenter'
import { type CriteresDesLieux, estFiltre } from '../../domain'
import {
  libelleDesResultats,
  parametresDeLURL,
} from '../presenters/libelles-des-filtres.presenter'

type LieuxTrouves = {
  readonly totalCount: number
  readonly page: number
  readonly pageSize: number
}

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const LieuxDuDepartementPage = ({
  departement,
  criteres,
  lieux,
  barre,
  listeDesLieux,
}: {
  departement: Departement
  criteres: CriteresDesLieux
  lieux: LieuxTrouves
  barre: BarreDuReseau
  listeDesLieux: ReactNode
}) => {
  const baseHref = hrefDesLieux(departement.code)
  const parametres = parametresDeLURL(criteres)

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
            <DataSearchBar
              baseHref={baseHref}
              state={parametres}
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
              {libelleDesResultats(lieux.totalCount, estFiltre(criteres))}
            </h2>
            <SortSelect
              options={[
                { label: 'Alphabétique (A à Z)', value: 'nomaz' },
                { label: 'Alphabétique (Z à A)', value: 'nomza' },
                {
                  label: 'Mise à jour récente',
                  value: 'majrecent',
                },
                {
                  label: 'Mise à jour ancienne',
                  value: 'majancien',
                },
              ]}
              baseHref={baseHref}
            />
          </div>

          <hr className="fr-separator-1px" />

          {listeDesLieux}

          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            itemsCount={lieux.totalCount}
            pageSize={lieux.pageSize}
            baseHref={baseHref}
            state={parametres}
            defaultPageSize={LIGNES_PAR_DEFAUT}
            pageSizeOptions={pageSizeOptions}
          />
        </main>
      </div>
    </>
  )
}

export default LieuxDuDepartementPage
