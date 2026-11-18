import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { afficherRdvsDansActivitesAction } from '@/app/_actions/rdvsp/afficher-rdvs-dans-activites.action'
import { creerActiviteDepuisRdvAction } from '@/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { rattraperRdvsSansWebhookAction } from '@/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateMediateur } from '@/auth/authenticateUser'
import { isCoordinateur, isMediateur } from '@/auth/userTypeGuards'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui'
import { optionsDeLaBarre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites'
import { listerMesActivites } from '@/features/activites/abilities/lister-mes-activites'
import {
  decompteDeLaListe,
  EnTeteDeLaListe,
  joursDeLaListe,
  ListeDeMesActivites,
  MesActivitesPage,
  parametresDeNavigation,
  rendezVousFiltrablesDansLaListe,
} from '@/features/activites/abilities/lister-mes-activites/ui'
import {
  contenuDeLaChronologie,
  criteresDesActivites,
  estFiltreDesActivites,
  MediateurId,
  ordreChronologiqueLu,
  paginationLue,
  parametresDesActivitesDe,
} from '@/features/activites/domain'
import { OUVRIR_LA_SAISIE_DU_STATUT_DU_RDV_KEY } from '@/features/activites/ui/carte/ouvrir-la-saisie-du-statut.key'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { filtresDeLaListe } from '@/features/activites/ui/filtres/filtres-de-la-liste'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/ui/filtres/plus-de-filtres/rechercher-employeuses.key'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite'
import { AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.key'
import AfficherLesRdvs from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/ui/AfficherLesRdvs'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/ui/rattraper-rdvs-sans-webhook.key'
import {
  periodeDesRendezVous,
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/creer-activite-depuis-rdv.key'
import SaisieDuStatutDuRdv, {
  useOuvrirLaSaisieDuStatut,
} from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/SaisieDuStatutDuRdv'
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
  const criteres = criteresDesActivites(parametres)
  const filtree = estFiltreDesActivites(criteres)
  const voirLesRdvs = parametres['voir-rdvs'] === '1'
  const compteRdv = user.rdvAccount?.hasOauthTokens ? user.rdvAccount : null
  const pagination = paginationLue(parametres)

  const chronologie = listerMesActivites({
    mediateurId,
    criteres,
    pagination,
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
                      rendezVousFiltrables={rendezVousFiltrablesDansLaListe({
                        compte: compteRdv,
                        voirLesRdvs,
                        statutsDemandes: criteres.statutsDeRendezVous.length,
                      })}
                      exportDesAccompagnements={
                        <ExportDeMesAccompagnements
                          filtres={filtresDeLaListe(criteres)}
                          options={options}
                          nombreDAccompagnements={chronologie.then(
                            ({ total }) => total.accompagnements,
                          )}
                        />
                      }
                    />
                    <ListeDeMesActivites
                      contenu={chronologie.then((lue) => ({
                        decompte: decompteDeLaListe(lue, filtree),
                        jours: joursDeLaListe(lue.elements, user.timezone),
                        total: lue.total.activites + lue.total.rendezVous,
                        lignesParPage: pagination.lignesParPage,
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
