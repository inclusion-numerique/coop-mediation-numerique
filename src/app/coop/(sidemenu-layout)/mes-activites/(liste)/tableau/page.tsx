import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { rechercherLesLieuxDeMesActivitesAction } from '@/app/_actions/activites/rechercher-les-lieux-de-mes-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/slots/ExportDeMesAccompagnements.slot'
import { optionsDesFiltres } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/options-de-la-barre.query'
import { tagsChoisis } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/tags-choisis.query'
import { chronologieAvec } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/chronologie.query'
import { BarreDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/components/BarreDeMesActivites'
import { filtresDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/filtres/filtres-de-mes-activites.filtre'
import { TableauDeMesActivitesPage } from '@/features/activites/abilities/lister-mes-activites/ui/pages/TableauDeMesActivitesPage'
import { barreDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/barre-de-mes-activites.presenter'
import { monTableauDActivites } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/page-de-mes-activites.presenter'
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
import { periodeDesRendezVous } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/periode-des-rendez-vous.query'
import {
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { ClientBinder } from '@/libraries/nextjs/injection'

type Parametres = Record<string, string | string[] | undefined>

const MesActivitesTableauRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const parametres = await searchParams
  const mediateurId = MediateurId(user.mediateur.id)

  const valeurs = filtresDeMesActivites.charger(parametres)

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
    adresse: { chemin: '/coop/mes-activites/tableau', parametres },
    valeurs,
    options,
    lieux: lieuxDuFiltrePresentes(lieux),
    tagsChoisis: tags,
  })

  const tableau = options.aDesActivites
    ? monTableauDActivites({
        mediateurId,
        parametres,
        criteres: criteresDesFiltres(valeurs),
        parametresDesFiltres: filtresDeMesActivites.parametresDe(valeurs),
        compteRdv: user.rdvAccount,
        timezone: user.timezone,
        chronologie: chronologieAvec({
          rendezVous: {
            selection: rendezVousAListerSql,
            parIds: rendezVousParIds,
          },
          rendezVousLies,
        }),
      })
    : null

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
            <TableauDeMesActivitesPage
              tableau={tableau}
              barreDeFiltres={
                tableau && (
                  <BarreDeMesActivites
                    barre={barre}
                    rendezVousFiltrables={tableau.rendezVousFiltrables}
                    exportDesAccompagnements={
                      <ExportDeMesAccompagnements
                        {...barre.export}
                        nombreDAccompagnements={tableau.nombreDAccompagnements}
                      />
                    }
                  />
                )
              }
              aussiCoordinateur={estCoordinateur(user) && estMediateur(user)}
            />
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesActivitesTableauRoute
