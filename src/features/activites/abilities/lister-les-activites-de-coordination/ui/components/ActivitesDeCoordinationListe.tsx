import { CoordinationEmptyState } from '../../../../ui/components/CoordinationEmptyState'
import { PaginationDesActivites } from '../../../../ui/components/PaginationDesActivites'
import type { ListeDesCoordinations } from '../presenters/liste-des-coordinations.presenter'
import { CarteDeCoordination } from './CarteDeCoordination'
import { DetailDeCoordinationModale } from './DetailDeCoordinationModale'

export const ActivitesDeCoordinationListe = ({
  liste: { titre, jours, total },
  filtre,
  pagination,
  lignesParPage,
}: {
  liste: ListeDesCoordinations
  filtre: boolean
  pagination: Readonly<Record<string, string>>
  lignesParPage: number
}) =>
  jours.length === 0 ? (
    <CoordinationEmptyState isFiltered={filtre} />
  ) : (
    <div>
      <div className="fr-flex fr-align-items-center fr-justify-content-space-between fr-width-full fr-my-6v">
        <h2 className="fr-text--bold fr-text--lg fr-mb-0">{titre}</h2>
      </div>
      <DetailDeCoordinationModale />
      {jours.map(({ cle, jour, cartes }) => (
        <div key={cle} className="fr-mb-8v">
          <h3 className="fr-text--xs fr-text-mention--grey fr-text--bold fr-text--uppercase fr-mt-6v fr-mb-4v">
            {jour}
          </h3>
          {cartes.map((carte) => (
            <CarteDeCoordination key={carte.id} carte={carte} />
          ))}
        </div>
      ))}
      <PaginationDesActivites
        className="fr-mt-12v"
        adresse="/coop/mes-coordinations"
        parametres={pagination}
        total={total}
        lignesParPage={lignesParPage}
      />
    </div>
  )
