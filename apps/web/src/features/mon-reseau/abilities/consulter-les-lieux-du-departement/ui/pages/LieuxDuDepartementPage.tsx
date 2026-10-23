import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import {
  hrefDuLieu,
  LieuActiviteCard,
} from '@app/web/features/lieux-activite/ui'
import type { Departement } from '@app/web/libraries/departement'
import { pluriel } from '@app/web/libraries/pluriel'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { contentId } from '@app/web/utils/skipLinks'
import { filDArianeDuReseau } from '../../../../ui/fil-d-ariane'
import { hrefDesLieux } from '../../../../ui/liens'
import {
  auteurDeLaDerniereModification,
  type LieuxTrouves,
} from '../../../../ui/lieu-affiche'
import {
  type CriteresDesLieux,
  estFiltre,
  type ParametresDesLieux,
} from '../../domain'
import { EtiquettesDeFiltres } from '../components/EtiquettesDeFiltres'
import Filtres from '../components/Filtres'
import { etiquettesDesCommunes } from '../libelles-des-filtres.presenter'

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const LIGNES_PAR_DEFAUT = 20

const libelleDesResultats = (total: number, filtre: boolean): string =>
  total > 0
    ? `${total} ${pluriel(total, 'lieu', 'lieux')}`
    : filtre
      ? 'Aucun lieu ne correspond à votre recherche'
      : 'Aucun lieu référencé'

const LieuxDuDepartementPage = ({
  departement,
  criteres,
  parametres,
  lieux,
  communes,
}: {
  departement: Departement
  criteres: CriteresDesLieux
  parametres: ParametresDesLieux
  lieux: LieuxTrouves
  communes: SelectOption[]
}) => {
  const baseHref = hrefDesLieux(departement.code)

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
              className="ri-home-office-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
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
              searchParams={parametres}
              placeholder="Nom du lieu, adresse ou SIRET..."
              className="fr-flex-grow-1"
            />
            <Filtres communes={criteres.communes} options={communes} />
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

          {lieux.lieux.map((lieu) => (
            <LieuActiviteCard
              key={lieu.id}
              lieu={lieu}
              href={hrefDuLieu(lieu)}
              derniereModificationPar={auteurDeLaDerniereModification(lieu)}
            />
          ))}

          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            totalPages={lieux.totalPages}
            baseHref={baseHref}
            searchParams={parametres}
            defaultPageSize={LIGNES_PAR_DEFAUT}
            pageSizeOptions={pageSizeOptions}
          />
        </main>
      </div>
    </>
  )
}

export default LieuxDuDepartementPage
