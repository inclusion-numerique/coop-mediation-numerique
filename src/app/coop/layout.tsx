import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { choisirLaVisibiliteApresRuptureAction } from '@/app/_actions/mediateurs/choisir-la-visibilite-apres-rupture.action'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import InscriptionStepsLayout from '@/features/inscription/components/InscriptionStepsLayout'
import { consulterLaMaintenance } from '@/features/maintenance-mode/abilities/consulter-la-maintenance'
import { BanniereDeMaintenance } from '@/features/maintenance-mode/abilities/consulter-la-maintenance/ui'
import { messageAffiche } from '@/features/maintenance-mode/domain'
import { lireLaRuptureEnAttente } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.key'
import { ChoixDeVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/ui'
import { MediateurId } from '@/features/mediateurs/domain'
import { accesALaCoop } from '@/features/navigation/domain'
import {
  AccesReserveAuxUtilisateurs,
  CoopShell,
} from '@/features/navigation/ui/coquille'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()
  const acces = accesALaCoop({
    role: user.role,
    inscriptionAchevee: hasInscriptionComplete(user),
  })

  if (acces._tag === 'ReserveAuxUtilisateurs') {
    return (
      <CoopShell cadre="etape" user={user}>
        <InscriptionStepsLayout>
          <AccesReserveAuxUtilisateurs role={acces.role} />
        </InscriptionStepsLayout>
      </CoopShell>
    )
  }

  if (acces._tag === 'InscriptionInachevee') {
    redirect('/inscription')
  }

  const ruptureEnAttente =
    user.mediateur == null
      ? null
      : await lireLaRuptureEnAttente({
          mediateurId: MediateurId(user.mediateur.id),
        })

  if (ruptureEnAttente != null) {
    return (
      <CoopShell cadre="etape" user={user}>
        <InscriptionStepsLayout>
          <ClientBinder
            bind={CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY}
            to={choisirLaVisibiliteApresRuptureAction}
          >
            <ChoixDeVisibiliteApresRupture />
          </ClientBinder>
        </InscriptionStepsLayout>
      </CoopShell>
    )
  }

  const maintenance = await consulterLaMaintenance()

  return (
    <CoopShell
      cadre="application"
      banniere={
        maintenance._tag === 'Active' ? (
          <BanniereDeMaintenance message={messageAffiche(maintenance)} />
        ) : null
      }
    >
      {children}
    </CoopShell>
  )
}

export default Layout
