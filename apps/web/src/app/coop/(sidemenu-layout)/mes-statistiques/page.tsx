import { rechercherEmployeusesDesActivitesAction } from '@app/web/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { reglerLePartageStatistiquesAction } from '@app/web/app/_actions/mediateurs/regler-le-partage-statistiques.action'
import { rechercherLesLieuxDeMesStatistiquesAction } from '@app/web/app/_actions/statistiques/rechercher-les-lieux-de-mes-statistiques.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import { filtreDeLieu } from '@app/web/composition/statistiques/barre'
import { mesStatistiques } from '@app/web/composition/statistiques/mes-statistiques'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@app/web/composition/statistiques/sections'
import {
  nombreDAccompagnements,
  toutesLesStatistiques,
} from '@app/web/composition/statistiques/statistiques-fournies'
import { consulterMesLiensDePartage } from '@app/web/features/mediateurs/abilities/consulter-mes-liens-de-partage'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import { PartageStatistiques } from '@app/web/features/mediateurs/abilities/regler-le-partage-statistiques/ui'
import {
  CoordinateurId,
  MediateurId,
} from '@app/web/features/mediateurs/domain'
import {
  type ActivitesFilters,
  validateActivitesFilters,
} from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@app/web/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { MesStatistiques } from '@app/web/features/statistiques/ui/pages/MesStatistiques'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

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

  const { statistiques, ...options } = await mesStatistiques({
    user,
    activitesFilters: validateActivitesFilters(searchParams),
    graphOptions: {
      fin: searchParams.graphique_fin
        ? new Date(searchParams.graphique_fin)
        : undefined,
    },
  })
  const toutes = toutesLesStatistiques(statistiques)
  const [{ hasCrasV1 }, liensDePartage] = await Promise.all([
    statistiques.hasCrasV1,
    consulterMesLiensDePartage({
      mediateurId: user.mediateur?.id ? MediateurId(user.mediateur.id) : null,
      coordinateurId: user.coordinateur?.id
        ? CoordinateurId(user.coordinateur.id)
        : null,
    }),
  ])

  return (
    <ClientBinder
      bind={RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY}
      to={rechercherEmployeusesDesActivitesAction}
    >
      <ClientBinder
        bind={RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY}
        to={rechercherLesLieuxDeMesStatistiquesAction}
      >
        <ClientBinder
          bind={REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY}
          to={reglerLePartageStatistiquesAction}
        >
          <MesStatistiques
            {...options}
            user={user}
            hasCrasV1={hasCrasV1}
            accompagnementsCount={nombreDAccompagnements(toutes)}
            partage={<PartageStatistiques liens={liensDePartage} />}
            filtreDeLieu={filtreDeLieu(options)}
            impression={impressionDesStatistiques({
              ...options,
              statistiques: toutes,
            })}
            generale={sectionGenerale(statistiques, {
              debut: options.activitesFilters.du,
              fin: options.activitesFilters.au,
            })}
            activites={sectionActivites(statistiques, {
              canManageTags: true,
            })}
            beneficiaires={sectionBeneficiaires(statistiques)}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesStatistiquesPage
