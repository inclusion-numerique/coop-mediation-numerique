import type { Metadata } from 'next'
import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { rechercherLesLieuxDeMesActivitesAction } from '@/app/_actions/activites/rechercher-les-lieux-de-mes-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { afficherRdvsDansActivitesAction } from '@/app/_actions/rdvsp/afficher-rdvs-dans-activites.action'
import { creerActiviteDepuisRdvAction } from '@/app/_actions/rdvsp/creer-activite-depuis-rdv.action'
import { mettreAJourStatutRdvAction } from '@/app/_actions/rdvsp/mettre-a-jour-statut-rdv.action'
import { rattraperRdvsSansWebhookAction } from '@/app/_actions/rdvsp/rattraper-rdvs-sans-webhook.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { metadataTitle } from '@/configuration/projet'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/slots/ExportDeMesAccompagnements.slot'
import { optionsDesFiltres } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/options-de-la-barre.query'
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { chronologieAvec } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/chronologie.query'
import { filtresDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/filtres/filtres-de-mes-activites.filtre'
import { MaListeDActivitesPage } from '@/features/activites/abilities/lister-mes-activites/ui/pages/MaListeDActivitesPage'
import { barreDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/barre-de-mes-activites.presenter'
import { CHEMIN_DE_MES_ACTIVITES } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/liens-vers-mes-rendez-vous.presenter'
import { maListeDActivites } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/page-de-mes-activites.presenter'
import { BarreDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/slots/BarreDeMesActivites.slot'
import { lieuxDuFiltre } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/implementations/prisma/lieux-du-filtre.query'
import { lieuxDuFiltrePresentes } from '@/features/activites/abilities/rechercher-les-lieux-des-statistiques/ui/presenters/lieux-du-filtre.presenter'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/action/rechercher-employeuses.key'
import { RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY } from '@/features/activites/action/rechercher-les-lieux-des-activites.key'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/action/supprimer-une-activite-de-mediation.key'
import { MediateurId } from '@/features/activites/domain'
import { criteresDesFiltres } from '@/features/activites/ui/filtres/activites.filtre'
import {
  estCoordinateur,
  estMediateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { AFFICHER_RDVS_DANS_ACTIVITES_ACTION_KEY } from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/action/afficher-rdvs-dans-activites.key'
import AfficherLesRdvs from '@/features/rdvsp/abilities/afficher-rdvs-dans-activites/ui/slots/AfficherLesRdvs.slot'
import { periodeDesRendezVous } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/periode-des-rendez-vous.query'
import {
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { CREER_ACTIVITE_DEPUIS_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/creer-activite-depuis-rdv.key'
import { METTRE_A_JOUR_STATUT_RDV_ACTION_KEY } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.key'
import { RenseignerLeStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/slots/RenseignerLeStatut.slot'
import SaisieDuStatutDuRdv from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/ui/slots/SaisieDuStatutDuRdv.slot'
import { RATTRAPER_RDVS_SANS_WEBHOOK_ACTION_KEY } from '@/features/rdvsp/action/rattraper-rdvs-sans-webhook.key'
import { ClientBinder } from '@/libraries/nextjs/injection'

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

  const valeurs = filtresDeMesActivites.charger(parametres)

  const liste = maListeDActivites({
    mediateurId,
    parametres,
    criteres: criteresDesFiltres(valeurs),
    parametresDesFiltres: filtresDeMesActivites.parametresDe(valeurs),
    compteRdv: user.rdvAccount,
    timezone: user.timezone,
    chronologie: chronologieAvec({
      rendezVous: { selection: rendezVousAListerSql, parIds: rendezVousParIds },
      rendezVousLies,
    }),
  })

  const [options, lieux, tags] = await Promise.all([
    optionsDesFiltres({
      mediateurId,
      periodeDesRendezVous: () =>
        periodeDesRendezVous({
          comptes: user.rdvAccount ? [user.rdvAccount.id] : [],
        }),
    }),
    lieuxDuFiltre(
      { type: 'Mediateur', mediateur: mediateurId },
      {
        lieux: valeurs.lieux,
        communes: valeurs.communes,
        departements: valeurs.departements,
      },
    ),
    tagsChoisis(valeurs.tags),
  ])

  const barre = barreDeMesActivites({
    adresse: { chemin: CHEMIN_DE_MES_ACTIVITES, parametres },
    valeurs,
    options,
    lieux: lieuxDuFiltrePresentes(lieux),
    tagsChoisis: tags,
  })

  return (
    <ClientBinder
      bind={RECHERCHER_LES_LIEUX_DES_ACTIVITES_KEY}
      to={rechercherLesLieuxDeMesActivitesAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
        to={rechercherDesTagsAction}
      >
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
                    <MaListeDActivitesPage
                      liste={liste}
                      barreDeFiltres={
                        <BarreDeMesActivites
                          barre={barre}
                          rendezVousFiltrables={liste.rendezVousFiltrables}
                          exportDesAccompagnements={
                            <ExportDeMesAccompagnements
                              {...barre.export}
                              nombreDAccompagnements={
                                liste.nombreDAccompagnements
                              }
                            />
                          }
                        />
                      }
                      aussiCoordinateur={
                        estCoordinateur(user) && estMediateur(user)
                      }
                      saisieDuStatutDesRendezVous={<SaisieDuStatutDuRdv />}
                      renseignerLeStatut={(rdv) => (
                        <RenseignerLeStatut rdv={rdv} />
                      )}
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
    </ClientBinder>
  )
}

export default MesActivitesRoute
