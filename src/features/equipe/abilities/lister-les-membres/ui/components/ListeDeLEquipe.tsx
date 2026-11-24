import type { ReactNode } from 'react'
import { BarreDeFiltres } from '@/libraries/etat-d-url/filtres/BarreDeFiltres'
import { ChampDeRecherche } from '@/libraries/etat-d-url/liste/ChampDeRecherche'
import { PiedDeListe } from '@/libraries/etat-d-url/liste/PiedDeListe'
import type { LigneEquipe } from '../../../../domain'
import { filtresDeLEquipe } from '../../../../ui/filtres/equipe.filtre'
import type { MembresDeLEquipe } from '../../domain'
import {
  liensDeLaListe,
  type ParametresDeLaListe,
  paginationDeLEquipe,
} from '../filtres/liste-de-l-equipe.filtre'
import { lignesAffichees } from '../presenters/lister-les-membres.presenter'
import { EquipeTable } from './EquipeTable'
import EquipeVide from './EquipeVide'
import { FiltresDeLEquipe } from './FiltresDeLEquipe'

export const ListeDeLEquipe = ({
  membres,
  searchParams,
  baseHref,
  exporter,
  actions,
}: {
  membres: MembresDeLEquipe
  searchParams: ParametresDeLaListe
  baseHref: string
  exporter: ReactNode
  actions: ((ligne: LigneEquipe) => ReactNode) | null
}) => {
  const { items, statistiques, coordinateur } = membres
  const rows = lignesAffichees(items, coordinateur.departementCode)
  const adresse = { chemin: baseHref, parametres: searchParams }
  const liens = liensDeLaListe(adresse, membres)

  return (
    <>
      <div className="fr-my-4v fr-flex fr-flex-gap-4v fr-justify-content-space-between fr-align-items-center">
        <ChampDeRecherche
          className="fr-flex-grow-1"
          placeholder="Rechercher par nom ou adresse e-mail"
        />
        <div className="fr-flex-grow-2 fr-text--right">{exporter}</div>
      </div>
      <hr className="fr-separator-4v" />
      <BarreDeFiltres
        etiquettes={filtresDeLEquipe.etiquettes(
          adresse,
          filtresDeLEquipe.charger(searchParams),
        )}
        sansFiltres={filtresDeLEquipe.sansFiltres(adresse)}
      >
        <FiltresDeLEquipe
          actifs={statistiques.actifs}
          inactifs={statistiques.inactifs}
          invitations={statistiques.invitations}
          archives={statistiques.archives}
        />
      </BarreDeFiltres>
      {statistiques.total === 0 &&
      statistiques.archives === 0 &&
      rows.length === 0 ? (
        <EquipeVide />
      ) : (
        <EquipeTable
          lignes={rows}
          colonnes={liens.colonnes}
          actions={actions}
        />
      )}
      <PiedDeListe
        className="fr-mt-12v"
        liens={liens.pages}
        pagination={paginationDeLEquipe}
      />
    </>
  )
}
