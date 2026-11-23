import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { reglerLePartageStatistiquesAction } from '@/app/_actions/mediateurs/regler-le-partage-statistiques.action'
import { rechercherLesLieuxDeMesStatistiquesAction } from '@/app/_actions/statistiques/rechercher-les-lieux-de-mes-statistiques.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { decrireLesActivitesDuPerimetre } from '@/features/activites/abilities/decrire-les-activites-du-perimetre'
import {
  lieuxChoisisDe,
  nombreDAccompagnements,
  perimetreDeLUtilisateur,
  rassembler,
  statistiquesDuPerimetre,
  toutesLesStatistiques,
} from '@/features/activites/implementations/statistiques'
import { vocabulaireDesActivites } from '@/features/activites/ui/libelles/vocabulaire-des-statistiques'
import {
  blocsActivites,
  blocsBeneficiaires,
  blocsGeneraux,
  blocsImprimes,
} from '@/features/activites/ui/statistiques/blocs-des-statistiques'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticateUser'
import { getInitialBeneficiairesOptionsForSearch } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import { membresAFiltrerDuDemandeur } from '@/features/equipe/abilities/lister-les-membres-a-filtrer'
import { consulterMesLiensDePartage } from '@/features/mediateurs/abilities/consulter-mes-liens-de-partage'
import { REGLER_LE_PARTAGE_STATISTIQUES_ACTION_KEY } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/action/regler-le-partage-statistiques.key'
import { PartageStatistiques } from '@/features/mediateurs/abilities/regler-le-partage-statistiques/ui'
import { CoordinateurId, MediateurId } from '@/features/mediateurs/domain'
import { rendezVousAuxStatutsSql } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { rdvStatusOptions } from '@/features/rdvsp/ui/rdv-status'
import { mesStatistiques } from '@/features/statistiques/implementations/mes-statistiques'
import { FiltreDeLieu } from '@/features/statistiques/ui/filtres/FiltreDeLieu'
import {
  type ParametresDeLaPage,
  parametresDesStatistiques,
} from '@/features/statistiques/ui/filtres/parametres-de-la-page'
import { RECHERCHER_EMPLOYEUSES_DES_ACTIVITES_ACTION_KEY } from '@/features/statistiques/ui/filtres/plus-de-filtres/rechercher-employeuses-des-statistiques.key'
import { RECHERCHER_LES_LIEUX_DES_STATISTIQUES_ACTION_KEY } from '@/features/statistiques/ui/filtres/rechercher-les-lieux-des-statistiques.key'
import { MesStatistiques } from '@/features/statistiques/ui/pages/MesStatistiques'
import {
  impressionDesStatistiques,
  sectionActivites,
  sectionBeneficiaires,
  sectionGenerale,
} from '@/features/statistiques/ui/sections/sections-des-statistiques'
import { tagsVisiblesDuProfil } from '@/features/tags/abilities/lire-les-tags-visibles'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const sourcesDeMesStatistiques = {
  perimetreDe: perimetreDeLUtilisateur,
  lancer: statistiquesDuPerimetre(rendezVousAuxStatutsSql),
  rassembler,
  lieuxChoisis: lieuxChoisisDe,
  tagsVisibles: tagsVisiblesDuProfil,
  beneficiaires: getInitialBeneficiairesOptionsForSearch,
  membres: membresAFiltrerDuDemandeur,
  activitesDuPerimetre: decrireLesActivitesDuPerimetre,
  vocabulaire: {
    ...vocabulaireDesActivites,
    statutsDeRendezVous: rdvStatusOptions,
  },
}

export const metadata: Metadata = {
  title: metadataTitle('Mes statistiques'),
}
const MesStatistiquesPage = async (props: {
  searchParams: Promise<ParametresDeLaPage>
}) => {
  const searchParams = await props.searchParams
  const user = await authenticateMediateurOrCoordinateur()

  const { statistiques, ...options } = await mesStatistiques(
    {
      user,
      profil: profilDeLaSession(user),
      ...parametresDesStatistiques(searchParams),
    },
    sourcesDeMesStatistiques,
  )
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
            filtreDeLieu={<FiltreDeLieu choisis={options} />}
            impression={impressionDesStatistiques({
              ...options,
              imprimees: blocsImprimes,
              statistiques: toutes,
            })}
            generale={sectionGenerale(
              blocsGeneraux(statistiques, {
                debut: options.activitesFilters.du,
                fin: options.activitesFilters.au,
              }),
            )}
            activites={sectionActivites(blocsActivites(statistiques), {
              canManageTags: true,
            })}
            beneficiaires={sectionBeneficiaires(
              blocsBeneficiaires(statistiques),
            )}
          />
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesStatistiquesPage
