import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui/slots/ExportDeMesAccompagnements.slot'
import { optionsDeLaBarre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites/implementations/prisma/options-de-la-barre.query'
import { chronologieAvec } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/chronologie.query'
import { PageDuTableauDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui/pages/PageDuTableauDeMesActivites'
import { monTableauDActivites } from '@/features/activites/abilities/lister-mes-activites/ui/presenters/page-de-mes-activites.presenter'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/action/rechercher-employeuses.key'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/action/supprimer-une-activite-de-mediation.key'
import { MediateurId } from '@/features/activites/domain'
import {
  isCoordinateur,
  isMediateur,
} from '@/features/authentification/domain/profils-d-utilisateur'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user'
import { getMediateurCommunesAndDepartementsOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/communes-du-mediateur.query'
import { getLieuxDesActivitesOptions } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-des-activites.query'
import { periodeDesRendezVous } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/periode-des-rendez-vous.query'
import {
  rendezVousAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

type Parametres = Record<string, string | string[] | undefined>

const MesActivitesTableauRoute = async ({
  searchParams,
}: {
  searchParams: Promise<Parametres>
}) => {
  const user = await authenticateMediateur()
  const parametres = await searchParams
  const mediateurId = MediateurId(user.mediateur.id)

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

  const tableau = options.aDesActivites
    ? monTableauDActivites({
        mediateurId,
        parametres,
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
      bind={SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY}
      to={supprimerUneActiviteDeMediationAction}
    >
      <ClientBinder
        bind={RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY}
        to={rechercherEmployeusesDesActivitesAction}
      >
        <PageDuTableauDeMesActivites
          tableau={tableau}
          options={options}
          aussiCoordinateur={isCoordinateur(user) && isMediateur(user)}
          exportDesAccompagnements={
            tableau && (
              <ExportDeMesAccompagnements
                filtres={tableau.filtres}
                options={options}
                nombreDAccompagnements={tableau.nombreDAccompagnements}
              />
            )
          }
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default MesActivitesTableauRoute
