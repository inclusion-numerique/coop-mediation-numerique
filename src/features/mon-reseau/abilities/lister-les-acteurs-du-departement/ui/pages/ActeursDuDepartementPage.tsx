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
import type { Acteur } from '../../../../domain'
import { LIGNES_PAR_DEFAUT } from '../../../../domain'
import { CarteDActeur } from '../../../../ui/components/CarteDActeur'
import { EtiquettesDeFiltres } from '../../../../ui/components/EtiquettesDeFiltres'
import { filDArianeDuReseau } from '../../../../ui/presenters/fil-d-ariane'
import { hrefDesActeurs } from '../../../../ui/presenters/liens'
import {
  type CriteresActeurs,
  estFiltre,
  type PageDActeurs,
} from '../../domain'
import Filtres from '../components/Filtres'
import {
  etiquettesDesFiltres,
  groupesDActeurs,
  libelleDesResultats,
  parametresDeLURL,
} from '../presenters/acteurs.presenter'

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
  acteurs,
  communes,
}: {
  departement: Departement
  criteres: CriteresActeurs
  acteurs: PageDActeurs
  communes: SelectOption[]
}) => {
  const baseHref = hrefDesActeurs(departement.code)
  const parametres = parametresDeLURL(criteres)
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
              className="ri-account-circle-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
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
              state={parametres}
              placeholder="Nom, prénom ou adresse mail..."
              className="fr-flex-grow-1"
            />
            <Filtres
              key={`${departement.code}-${criteres.communes.join()}-${criteres.role}`}
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
            itemsCount={acteurs.total}
            pageSize={acteurs.lignes}
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

export default ActeursDuDepartementPage
