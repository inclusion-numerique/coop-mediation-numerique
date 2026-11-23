import { reglerLaMaintenanceAction } from '@/app/_actions/maintenance-mode/regler-la-maintenance.action'
import { relancerLesInscriptionsInacheveesAction } from '@/app/_actions/utilisateurs/relancer-les-inscriptions-inachevees.action'
import { relancerLesInscritsInactifsAction } from '@/app/_actions/utilisateurs/relancer-les-inscrits-inactifs.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { ExportDesAccompagnementsParDepartement } from '@/features/activites/abilities/exporter-les-accompagnements-par-departement/ui'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'
import {
  consulterLaMaintenance,
  consulterLHistoriqueDesMaintenances,
} from '@/features/maintenance-mode/abilities/consulter-la-maintenance'
import { REGLER_LA_MAINTENANCE_ACTION_KEY } from '@/features/maintenance-mode/abilities/regler-la-maintenance/action/regler-la-maintenance.key'
import { ReglageDeLaMaintenance } from '@/features/maintenance-mode/abilities/regler-la-maintenance/ui'
import { RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/action/relancer-les-inscriptions-inachevees.key'
import { LancerLesRelancesDInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/ui'
import { RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/action/relancer-les-inscrits-inactifs.key'
import { LancerLesRelancesDesInscrits } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/ui'
import { OutilsAdministrateurPage } from '@/features/utilisateurs/ui/pages/OutilsAdministrateurPage'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Outils administrateur'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  await authenticateAdmin()
  const [maintenance, historique] = await Promise.all([
    consulterLaMaintenance(),
    consulterLHistoriqueDesMaintenances(),
  ])

  return (
    <OutilsAdministrateurPage
      maintenance={
        <ClientBinder
          bind={REGLER_LA_MAINTENANCE_ACTION_KEY}
          to={reglerLaMaintenanceAction}
        >
          <ReglageDeLaMaintenance etat={maintenance} historique={historique} />
        </ClientBinder>
      }
      exportDesAccompagnements={<ExportDesAccompagnementsParDepartement />}
      relances={
        <>
          <ClientBinder
            bind={RELANCER_LES_INSCRIPTIONS_INACHEVEES_ACTION_KEY}
            to={relancerLesInscriptionsInacheveesAction}
          >
            <LancerLesRelancesDInscription />
          </ClientBinder>
          <ClientBinder
            bind={RELANCER_LES_INSCRITS_INACTIFS_ACTION_KEY}
            to={relancerLesInscritsInactifsAction}
          >
            <LancerLesRelancesDesInscrits />
          </ClientBinder>
        </>
      }
    />
  )
}

export default Page
