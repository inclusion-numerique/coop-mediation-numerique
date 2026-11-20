import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { reglerLePartageStatistiquesAction } from '@/app/_actions/mediateurs/regler-le-partage-statistiques.action'
import { rechercherLesLieuxDeMesStatistiquesAction } from '@/app/_actions/statistiques/rechercher-les-lieux-de-mes-statistiques.action'
import { filtreDeLieu } from '@/composition/statistiques/barre'
import { mesStatistiques } from '@/composition/statistiques/mes-statistiques'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/composition/statistiques/sections'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  nombreDAccompagnements,
  toutesLesStatistiques,
} from '@/features/activites/implementation/statistiques'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementation/session/authenticateUser'
import { consulterMesLiensDePartage } from '@/features/mediateurs/abilities/consulter-mes-liens-de-partage'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import { PartageStatistiques } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/ui'
import { CoordinateurId, MediateurId } from '@/features/mediateurs/domain'
import {
  type ParametresDeLaPage,
  parametresDesStatistiques,
} from '@/features/statistiques/ui/filtres/parametres-de-la-page'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { MesStatistiques } from '@/features/statistiques/ui/pages/MesStatistiques'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}
const MesStatistiquesPage = async (props: {
  searchParams: Promise<ParametresDeLaPage>
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateurOrCoordinateur()

  const { statistiques, ...options } = await mesStatistiques({
    user,
    ...parametresDesStatistiques(searchParams),
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
