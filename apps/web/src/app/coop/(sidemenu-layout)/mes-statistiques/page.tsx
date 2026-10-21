import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { reglerLePartageStatistiquesAction } from '@app/web/app/_actions/mediateurs/regler-le-partage-statistiques.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import {
  consulterEmployeuseAUneDate,
  employeuseCodeInsee,
} from '@app/web/features/employeuse/server'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@app/web/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { consulterMonLienDePartage } from '@app/web/features/mediateurs/abilities/consulter-mon-lien-de-partage'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import {
  CoordinateurId,
  MediateurId,
} from '@app/web/features/mediateurs/domain'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { mediateurCoordonnesIdsFor } from '@app/web/mediateurs/mediateurCoordonnesIdsFor'
import type { Metadata } from 'next'
import { getMesStatistiquesPageData } from './getMesStatistiquesPageData'
import { MesStatistiques } from './MesStatistiques'

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}
const MesStatistiquesPage = async (props: {
  searchParams: Promise<
    ActivitesFilters & {
      graphique_fin?: string
    }
  >
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateurOrCoordinateur()

  const mediateurCoordonnesIds = mediateurCoordonnesIdsFor(user)

  const mesStatistiques = await getMesStatistiquesPageData({
    user,
    activitesFilters: validateActivitesFilters(searchParams),
    graphOptions: {
      fin: searchParams.graphique_fin
        ? new Date(searchParams.graphique_fin)
        : undefined,
    },
  })

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  const lienDePartage = await consulterMonLienDePartage({
    mediateurId: user.mediateur?.id ? MediateurId(user.mediateur.id) : null,
    coordinateurId: user.coordinateur?.id
      ? CoordinateurId(user.coordinateur.id)
      : null,
  })

  return (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY}
        to={reglerLePartageStatistiquesAction}
      >
        <MesStatistiques
          user={user}
          mediateurCoordonnesCount={mediateurCoordonnesIds.length}
          codeInsee={employeuse ? employeuseCodeInsee(employeuse) : undefined}
          lienDePartage={lienDePartage}
          {...mesStatistiques}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesStatistiquesPage
