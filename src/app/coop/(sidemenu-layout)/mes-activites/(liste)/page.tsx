import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { afficherRdvsDansActivitesAction } from '@/app/_actions/rdvsp/afficher-rdvs-dans-activites.action'
import { creerActiviteDepuisRdvAction } from '@/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { rattraperRdvsSansWebhookAction } from '@/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/components/ExportDeMesAccompagnements'
import { optionsDeLaBarre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/options-de-la-barre.query'
import { maListeDActivites } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/mes-activites.query'
import { PageDeMaListeDActivites } from '@/features/activites/abilities/lister-mes-activites/ui/pages/PageDeMaListeDActivites'
import { MediateurId } from '@/features/activites/domain'
import { OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY } from '@/features/activites/ui/carte/ouvrir-la-saisie-du-statut.key'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/ui/filtres/plus-de-filtres/rechercher-employeuses.key'
import {
  isCoordinateur,
  isMediateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user'
import { getMediateurCommunesAndDepartementsOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/communes-du-mediateur.query'
import { getLieuxDesActivitesOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-des-activites.query'
import { AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.key'
import AfficherLesRdvs from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/ui/AfficherLesRdvs'
import { periodeDesRendezVous } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/periode-des-rendez-vous.query'
import {
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/creer-activite-depuis-rdv.key'
import SaisieDuStatutDuRdv, {
  useOuvrirLaSaisieDuStatut,
} from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/SaisieDuStatutDuRdv'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@/features/rdvsp/ui/rattraper-rdvs-sans-webhook.key'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités'),
}

type Parametres = Record<string, string | string[] | undefined>

const MesActivitesRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const parametres = await searchParams
  const mediateurId = MediateurId(user.mediateur.id)

  const liste = maListeDActivites({
    mediateurId,
    parametres,
    compteRdv: user.rdvAccount,
    timezone: user.timezone,
    rendezVous: {
      selection: rendezVousAListerSql,
      parIds: rendezVousParIds,
    },
    rendezVousLies,
  })

  const options = await optionsDeLaBarre({
    mediateurId,
    lieuxDesActivites: () =>
      getLieuxDesActivitesOptions({
        mediateurIds: [mediateurId],
        mediateurId,
      }),
    communesEtDepartements: () =>
      getMediateurCommunesAndDepartementsOptions({
        mediateurIds: [mediateurId],
      }),
    periodeDesRendezVous: () =>
      periodeDesRendezVous({
        comptes: user.rdvAccount ? [user.rdvAccount.id] : [],
      }),
  })

  return (
    <ClientBinder
      bind={SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY}
      to={supprimerUneActiviteDeMediationAction}
    >
      <ClientBinder
        bind={RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY}
        to={rechercherEmployeusesDesActivitesAction}
      >
        <ClientBinder
          bind={AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY}
          to={afficherRdvsDansActivitesAction}
        >
          <ClientBinder
            bind={RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY}
            to={rattraperRdvsSansWebhookAction}
          >
            <ClientBinder
              bind={CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY}
              to={creerActiviteDepuisRdvAction}
            >
              <ClientBinder
                bind={METTRE_A_JOUR_STATUT_RDV_ACTION_KEY}
                to={mettreAJourStatutRdvAction}
              >
                <ClientBinder
                  bind={OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY}
                  to={useOuvrirLaSaisieDuStatut}
                >
                  <PageDeMaListeDActivites
                    liste={liste}
                    options={options}
                    aussiCoordinateur={
                      isCoordinateur(user) && isMediateur(user)
                    }
                    saisieDuStatutDesRendezVous={<SaisieDuStatutDuRdv />}
                    exportDesAccompagnements={
                      <ExportDeMesAccompagnements
                        filtres={liste.filtres}
                        options={options}
                        nombreDAccompagnements={liste.nombreDAccompagnements}
                      />
                    }
                    basculeDesRendezVous={
                      liste.bascule === null ? null : (
                        <AfficherLesRdvs {...liste.bascule} />
                      )
                    }
                  />
                </ClientBinder>
              </ClientBinder>
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesActivitesRoute
