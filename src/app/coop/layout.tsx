import { redirect } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { choisirLaVisibiliteApresRuptureAction } from '@/app/_actions/mediateurs/choisir-la-visibilite-apres-rupture.action'
import {
  aTermineSonInscription,
  pageDAccueil,
} from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import InscriptionStepsLayout from '@/features/inscription/ui/slots/InscriptionStepsLayout.slot'
import { BanniereDeMaintenance } from '@/features/maintenance-mode/abilities/consulter-la-maintenance/ui/slots/BanniereDeMaintenance.slot'
import { messageAffiche } from '@/features/maintenance-mode/domain'
import { consulterLaMaintenance } from '@/features/maintenance-mode/implementations/prisma/etat-de-maintenance.query'
import { CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/action/choisir-la-visibilite-apres-rupture.key'
import { lireLaRuptureEnAttente } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/implementations/prisma/rupture-en-attente.query'
import { ChoixDeVisibiliteApresRupture } from '@/features/mediateurs/abilities/choisir-la-visibilite-apres-rupture/ui/slots/ChoixDeVisibiliteApresRupture.slot'
import { MediateurId } from '@/features/mediateurs/domain'
import { accesALaCoop } from '@/features/navigation/domain'
import { CoopShellLayout } from '@/features/navigation/ui/layouts/CoopShellLayout'
import { AccesReserveAuxUtilisateurs } from '@/features/navigation/ui/slots/AccesReserveAuxUtilisateurs.slot'
import TerminerUsurpationHeaderUserMenuItem from '@/features/utilisateurs/abilities/terminer-l-usurpation/ui/slots/TerminerUsurpationHeaderUserMenuItem.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

const Layout = async ({ children }: PropsWithChildren) => {
  const user = await authenticateUser()
  const acces = accesALaCoop({
    role: user.role,
    inscriptionAchevee: aTermineSonInscription(user),
  })

  if (acces._tag === 'ReserveAuxUtilisateurs') {
    return (
      <CoopShellLayout
        cadre="etape"
        user={user}
        accueil={pageDAccueil(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
      >
        <InscriptionStepsLayout>
          <AccesReserveAuxUtilisateurs role={acces.role} />
        </InscriptionStepsLayout>
      </CoopShellLayout>
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
      <CoopShellLayout
        cadre="etape"
        user={user}
        accueil={pageDAccueil(user)}
        terminerUsurpation={<TerminerUsurpationHeaderUserMenuItem />}
      >
        <InscriptionStepsLayout>
          <ClientBinder
            bind={CHOISIR_LA_VISIBILITE_APRES_RUPTURE_ACTION_KEY}
            to={choisirLaVisibiliteApresRuptureAction}
          >
            <ChoixDeVisibiliteApresRupture />
          </ClientBinder>
        </InscriptionStepsLayout>
      </CoopShellLayout>
    )
  }

  const maintenance = await consulterLaMaintenance()

  return (
    <CoopShellLayout
      cadre="application"
      banniere={
        maintenance._tag === 'Active' ? (
          <BanniereDeMaintenance message={messageAffiche(maintenance)} />
        ) : null
      }
    >
      {children}
    </CoopShellLayout>
  )
}

export default Layout
