import type { SelectOption } from '@app/ui/components/Form/utils/options'
import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import type { Departement } from '@app/web/libraries/departement'
import DataSearchBar from '@app/web/libs/data-table/DataSearchBar'
import PaginationNavWithPageSizeSelect from '@app/web/libs/data-table/PaginationNavWithPageSizeSelect'
import { generatePageSizeSelectOptions } from '@app/web/libs/data-table/pageSizeSelectOptions'
import SortSelect from '@app/web/libs/data-table/SortSelect'
import { contentId } from '@app/web/utils/skipLinks'
import type { Acteur } from '../../../../domain'
import { LIGNES_PAR_DEFAUT } from '../../../../domain'
import { CarteDActeur } from '../../../../ui/CarteDActeur'
import { EtiquettesDeFiltres } from '../../../../ui/EtiquettesDeFiltres'
import { filDArianeDuReseau } from '../../../../ui/fil-d-ariane'
import { hrefDesActeurs } from '../../../../ui/liens'
import {
  type CriteresActeurs,
  estFiltre,
  type PageDActeurs,
  type ParametresDesActeurs,
} from '../../domain'
import {
  etiquettesDesFiltres,
  groupesDActeurs,
  libelleDesResultats,
} from '../acteurs.presenter'
import Filtres from '../components/Filtres'

const pageSizeOptions = generatePageSizeSelectOptions([20, 50, 100])

const GroupeDActeurs = ({
  titre,
  acteurs,
  departement,
}: {
  titre: string
  acteurs: readonly Acteur[]
  departement: string
}) =>
  acteurs.length > 0 && (
    <section className="fr-mt-4v">
      <h3 className="fr-h6 fr-mb-2v">{titre}</h3>
      {acteurs.map((acteur) => (
        <CarteDActeur
          key={acteur.acteurId}
          acteur={acteur}
          departement={departement}
        />
      ))}
    </section>
  )

const ActeursDuDepartementPage = ({
  departement,
  criteres,
  parametres,
  acteurs,
  communes,
}: {
  departement: Departement
  criteres: CriteresActeurs
  parametres: ParametresDesActeurs
  acteurs: PageDActeurs
  communes: SelectOption[]
}) => {
  const baseHref = hrefDesActeurs(departement.code)
  const groupes = groupesDActeurs(acteurs.acteurs)
  const sansCoordinateur =
    groupes.coordinateursDuDispositif.length === 0 &&
    groupes.coordinateursHorsDispositif.length === 0

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--medium">
        <CoopBreadcrumbs
          currentPage="Annuaire des acteurs"
          parents={filDArianeDuReseau(departement.code)}
        />
        <main id={contentId} className="fr-mb-16w fr-mt-8v">
          <BackButton />
          <div className="fr-flex fr-align-items-center fr-flex-gap-6v fr-mb-6v">
            <span
              className="ri-account-circle-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <div>
              <h1 className="fr-page-title fr-m-0 fr-h2">
                Annuaire des acteurs
              </h1>
              <p className="fr-text--xs fr-text--bold fr-text--uppercase fr-text-mention--grey fr-mb-0">
                {departement.nom} ({departement.code})
              </p>
            </div>
          </div>

          <div className="fr-flex fr-align-items-center fr-flex-gap-4v fr-mb-6v fr-mt-12v">
            <DataSearchBar
              baseHref={baseHref}
              searchParams={parametres}
              placeholder="Nom, prénom ou adresse mail..."
              className="fr-flex-grow-1"
            />
            <Filtres
              communes={criteres.communes}
              role={criteres.role}
              options={communes}
            />
          </div>

          <EtiquettesDeFiltres
            etiquettes={etiquettesDesFiltres(criteres, communes)}
          />

          <hr className="fr-separator-1px" />

          <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-my-6v">
            <h2 className="fr-text--bold fr-text--xs fr-text--uppercase fr-mb-0">
              {libelleDesResultats(acteurs.total, estFiltre(criteres))}
            </h2>
            <SortSelect
              options={[
                { label: 'Nom (A à Z)', value: 'nomaz' },
                { label: 'Nom (Z à A)', value: 'nomza' },
              ]}
              baseHref={baseHref}
            />
          </div>

          <hr className="fr-separator-1px" />

          {sansCoordinateur ? (
            acteurs.acteurs.map((acteur) => (
              <CarteDActeur
                key={acteur.acteurId}
                acteur={acteur}
                departement={departement.code}
              />
            ))
          ) : (
            <>
              <GroupeDActeurs
                titre="Coordinateur·rices du dispositif"
                acteurs={groupes.coordinateursDuDispositif}
                departement={departement.code}
              />
              <GroupeDActeurs
                titre="Coordinateur·rices hors dispositif"
                acteurs={groupes.coordinateursHorsDispositif}
                departement={departement.code}
              />
              <GroupeDActeurs
                titre="Autres acteurs"
                acteurs={groupes.autres}
                departement={departement.code}
              />
            </>
          )}

          <PaginationNavWithPageSizeSelect
            className="fr-mt-12v"
            totalPages={acteurs.pages}
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

export default ActeursDuDepartementPage
