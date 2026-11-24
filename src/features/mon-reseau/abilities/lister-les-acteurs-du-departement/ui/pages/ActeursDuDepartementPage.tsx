import type { Departement } from '@/libraries/departement'
import type { LiensDePagination } from '@/libraries/etat-d-url/definition/composition'
import { BarreDeFiltres } from '@/libraries/etat-d-url/filtres/BarreDeFiltres'
import { ChampDeRecherche } from '@/libraries/etat-d-url/liste/ChampDeRecherche'
import { PiedDeListe } from '@/libraries/etat-d-url/liste/PiedDeListe'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skipLinks'
import BackButton from '@/libraries/ui/components/BackButton'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import type { Acteur } from '../../../../domain'
import { FiltreDesCommunesDuReseau } from '../../../../ui/components/FiltreDesCommunesDuReseau'
import { paginationDuReseau } from '../../../../ui/filtres/reseau.filtre'
import type { BarreDuReseau } from '../../../../ui/presenters/barre-du-reseau.presenter'
import { filDArianeDuReseau } from '../../../../ui/presenters/fil-d-ariane.presenter'
import {
  type CriteresActeurs,
  estFiltre,
  type PageDActeurs,
} from '../../domain'
import { CarteDActeur } from '../components/CarteDActeur'
import { FiltreDuRoleDeLActeur } from '../components/FiltreDuRoleDeLActeur'
import { TriDesActeursDuReseau } from '../components/TriDesActeursDuReseau'
import {
  groupesDActeurs,
  libelleDesResultats,
} from '../presenters/acteurs.presenter'

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
  barre,
  pages,
}: {
  departement: Departement
  criteres: CriteresActeurs
  acteurs: PageDActeurs
  barre: BarreDuReseau
  pages: LiensDePagination
}) => {
  const groupes = groupesDActeurs(acteurs.items)
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
            <ChampDeRecherche
              placeholder="Nom, prénom ou adresse mail..."
              className="fr-flex-grow-1"
            />
          </div>

          <BarreDeFiltres
            etiquettes={barre.etiquettes}
            sansFiltres={barre.sansFiltres}
          >
            <FiltreDesCommunesDuReseau {...barre.communes} />
            <FiltreDuRoleDeLActeur />
          </BarreDeFiltres>

          <hr className="fr-separator-1px" />

          <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-my-6v">
            <h2 className="fr-text--bold fr-text--xs fr-text--uppercase fr-mb-0">
              {libelleDesResultats(acteurs.totalItems, estFiltre(criteres))}
            </h2>
            <TriDesActeursDuReseau />
          </div>

          <hr className="fr-separator-1px" />

          {sansCoordinateur ? (
            acteurs.items.map((acteur) => (
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

export default ActeursDuDepartementPage
