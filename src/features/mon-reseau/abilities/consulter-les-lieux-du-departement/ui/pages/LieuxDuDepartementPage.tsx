import type { ReactNode } from 'react'
import {
  DataSearchBar,
  generatePageSizeSelectOptions,
  PaginationNavWithPageSizeSelect,
} from '@/libraries/data-table'
import SortSelect from '@/libraries/data-table/sort/SortSelect'
import type { Departement } from '@/libraries/departement'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { LIGNES_PAR_DEFAUT } from '../../../../domain'
import { EtiquettesDeFiltres } from '../../../../ui/components/EtiquettesDeFiltres'
import { filDArianeDuReseau } from '../../../../ui/presenters/fil-d-ariane'
import { hrefDesLieux } from '../../../../ui/presenters/liens'
import { type CriteresDesLieux, estFiltre } from '../../domain'
import Filtres from '../components/Filtres'
import {
  etiquettesDesCommunes,
  libelleDesResultats,
  parametresDeLURL,
} from './libelles-des-filtres.presenter'
import { type LieuxTrouves } from './lieu-affiche'

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const LieuxDuDepartementPage = ({
  departement,
  criteres,
  lieux,
  communes,
  listeDesLieux,
}: {
  departement: Departement
  criteres: CriteresDesLieux
  lieux: LieuxTrouves
  communes: SelectOption[]
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
            <Filtres
              key={`${departement.code}-${criteres.communes.join()}`}
              communes={criteres.communes}
              options={communes}
            />
          </div>

          <EtiquettesDeFiltres
            etiquettes={etiquettesDesCommunes(criteres, communes)}
          />

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
