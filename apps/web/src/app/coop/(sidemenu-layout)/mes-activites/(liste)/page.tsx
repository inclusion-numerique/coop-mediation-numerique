import { rechercherEmployeusesDesActivitesAction } from '@app/web/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@app/web/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { afficherRdvsDansActivitesAction } from '@app/web/app/_actions/rdvsp/afficher-rdvs-dans-activites.action'
import { creerActiviteDepuisRdvAction } from '@app/web/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@app/web/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { rattraperRdvsSansWebhookAction } from '@app/web/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@app/web/auth/userTypeGuards'
import { optionsDeLaBarre } from '@app/web/features/activites/abilities/lister-les-options-de-filtre-des-activites'
import { listerMesActivites } from '@app/web/features/activites/abilities/lister-mes-activites'
import {
  decompteDeLaListe,
  EnTeteDeLaListe,
  joursDeLaListe,
  ListeDeMesActivites,
  MesActivitesPage,
} from '@app/web/features/activites/abilities/lister-mes-activites/ui'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@app/web/features/activites/abilities/supprimer-une-activite-de-mediation/action/supprimer-une-activite-de-mediation.key'
import {
  contenuDeLaChronologie,
  criteresDesActivites,
  estFiltreDesActivites,
  MediateurId,
  ordreChronologiqueLu,
  paginationLue,
  parametresDesActivitesDe,
} from '@app/web/features/activites/domain'
import { OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY } from '@app/web/features/activites/ui/carte/ouvrir-la-saisie-du-statut.key'
import { filtresDeLaListe } from '@app/web/features/activites/ui/filtres/filtres-de-la-liste'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@app/web/features/activites/ui/filtres/plus-de-filtres/rechercher-employeuses.key'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@app/web/features/lieux-activite'
import { AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY } from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.key'
import AfficherLesRdvs from '@app/web/features/rdvsp/abilities/afficher-rdvs-dans-activites/ui/AfficherLesRdvs'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/creer-activite-depuis-rdv/action/creer-activite-depuis-rdv.key'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@app/web/features/rdvsp/abilities/declencher-synchronisation/action/rattraper-rdvs-sans-webhook.key'
import {
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import SaisieDuStatutDuRdv, {
  useOuvrirLaSaisieDuStatut,
} from '@app/web/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/SaisieDuStatutDuRdv'
import { getFirstAndLastRdvDate } from '@app/web/features/rdvsp/db/premier-et-dernier-rdv.query'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: metadataTitle('Mes activités'),
}

type Parametres = Record<string, string | string[] | undefined>

const PARAMETRES_DE_NAVIGATION = ['page', 'lignes', 'ordre', 'tri', 'voir-rdvs']

const parametresDeNavigation = (parametres: Parametres) =>
  Object.fromEntries(
    PARAMETRES_DE_NAVIGATION.flatMap((cle) => {
      const valeur = parametres[cle]
      return typeof valeur === 'string' ? [[cle, valeur]] : []
    }),
  )

const MesActivitesRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const parametres = await searchParams
  const mediateurId = MediateurId(user.mediateur.id)
  const criteres = criteresDesActivites(parametres)
  const filtree = estFiltreDesActivites(criteres)
  const voirLesRdvs = parametres['voir-rdvs'] === '1'
  const compteRdv = user.rdvAccount?.hasOauthTokens ? user.rdvAccount : null

  const chronologie = listerMesActivites({
    mediateurId,
    criteres,
    pagination: paginationLue(parametres),
    ordre: ordreChronologiqueLu(parametres.ordre),
    contenu: contenuDeLaChronologie(
      criteres,
      compteRdv === null
        ? { _tag: 'NonConnecte' }
        : {
            _tag: 'Connecte',
            affichesDansLaListe:
              compteRdv.includeRdvsInActivitesList || voirLesRdvs,
          },
    ),
    rendezVous:
      user.rdvAccount == null
        ? null
        : {
            comptes: [user.rdvAccount.id],
            selection: rendezVousAListerSql,
            parIds: rendezVousParIds,
          },
    rendezVousLies,
    conseillersNumeriques: conseillerNumeriqueSql,
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
      getFirstAndLastRdvDate({
        rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
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
                  <MesActivitesPage
                    vue="liste"
                    sousTitre={
                      isCoordinateur(user) && isMediateur(user)
                        ? 'Médiation numérique'
                        : undefined
                    }
                    saisieDuStatutDesRendezVous={<SaisieDuStatutDuRdv />}
                  >
                    <EnTeteDeLaListe
                      filtres={filtresDeLaListe(criteres)}
                      options={options}
                      rendezVousFiltrables={
                        compteRdv !== null &&
                        (compteRdv.includeRdvsInActivitesList ||
                          criteres.statutsDeRendezVous.length > 0 ||
                          voirLesRdvs)
                      }
                      nombreDAccompagnements={chronologie.then(
                        ({ total }) => total.accompagnements,
                      )}
                    />
                    <ListeDeMesActivites
                      contenu={chronologie.then((lue) => ({
                        decompte: decompteDeLaListe(lue, filtree),
                        jours: joursDeLaListe(lue.elements, user.timezone),
                        pages: lue.pages,
                        aucuneActivite: lue.elements.length === 0 && !filtree,
                      }))}
                      basculeDesRendezVous={
                        compteRdv === null ? null : (
                          <AfficherLesRdvs
                            includeRdvsInActivitesList={
                              compteRdv.includeRdvsInActivitesList
                            }
                            syncDataOnLoad={
                              compteRdv.invalidWebhookOrganisationIds.length > 0
                            }
                          />
                        )
                      }
                      parametres={{
                        ...parametresDesActivitesDe(criteres),
                        ...parametresDeNavigation(parametres),
                      }}
                    />
                  </MesActivitesPage>
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
