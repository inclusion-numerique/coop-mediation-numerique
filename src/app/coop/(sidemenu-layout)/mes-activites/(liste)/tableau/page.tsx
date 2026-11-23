import { rechercherEmployeusesDesActivitesAction } from '@/app/_actions/activites/rechercher-employeuses-des-activites.action'
import { supprimerUneActiviteDeMediationAction } from '@/app/_actions/activites/supprimer-une-activite-de-mediation.action'
import { ExportDeMesAccompagnements } from '@/features/activites/abilities/exporter-mes-accompagnements/ui'
import { optionsDeLaBarre } from '@/features/activites/abilities/lister-les-options-de-filtre-des-activites'
import { monTableauDActivites } from '@/features/activites/abilities/lister-mes-activites'
import { PageDuTableauDeMesActivites } from '@/features/activites/abilities/lister-mes-activites/ui'
import { MediateurId } from '@/features/activites/domain'
import { SUPPRIMER_UNE_ACTIVITE_DE_MEDIATION_ACTION_KEY } from '@/features/activites/ui/detail/supprimer-une-activite-de-mediation.key'
import { RECHERCHER_LES_EMPLOYEUSES_DE_LA_LISTE_KEY } from '@/features/activites/ui/filtres/plus-de-filtres/rechercher-employeuses.key'
import {
  isCoordinateur,
  isMediateur,
} from '@/features/authentification/domain/userTypeGuards'
import { authenticateMediateur } from '@/features/authentification/implementation/session/authenticateUser'
import {
  getLieuxDesActivitesOptions,
  getMediateurCommunesAndDepartementsOptions,
} from '@/features/lieux-activite'
import {
  periodeDesRendezVous,
  rendezVousLies,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
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
        rendezVousLies,
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
