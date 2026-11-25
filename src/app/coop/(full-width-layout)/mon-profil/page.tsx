import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { activerLaMediationNumeriqueAction } from '@/app/_actions/utilisateurs/activer-la-mediation-numerique.action'
import { supprimerMonCompteAction } from '@/app/_actions/utilisateurs/supprimer-mon-compte.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterLeContrat } from '@/features/mediateurs/abilities/consulter-le-contrat/implementations/prisma/contrat.query'
import { CarteContrat } from '@/features/mediateurs/abilities/consulter-le-contrat/ui/slots/CarteContrat.slot'
import { UtilisateurId } from '@/features/mediateurs/domain'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.key'
import { CarteMediationNumerique } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/ui/slots/CarteMediationNumerique.slot'
import { MonProfilPage } from '@/features/utilisateurs/abilities/consulter-mon-profil/ui/pages/MonProfilPage'
import { SUPPRIMER_MON_COMPTE_ACTION_KEY } from '@/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.key'
import { CarteSupprimerMonCompte } from '@/features/utilisateurs/abilities/supprimer-compte/ui/slots/CarteSupprimerMonCompte.slot'
import {
  identiteDuProfil,
  sectionsDuProfil,
} from '@/features/utilisateurs/ui/presenters/mon-profil.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Mon profil'),
}

const MonProfil = async () => {
  const user = await authenticateUser()

  if (!user) return redirect('/')

  const visibles = sectionsDuProfil({
    coordinateur: user.coordinateur !== null,
    conseillerNumerique: user.isConseillerNumerique,
  })
  const contrat = visibles.contrat
    ? await consulterLeContrat({ utilisateurId: UtilisateurId(user.id) })
    : null

  return (
    <ClientBinder
      bind={ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY}
      to={activerLaMediationNumeriqueAction}
    >
      <ClientBinder
        bind={SUPPRIMER_MON_COMPTE_ACTION_KEY}
        to={supprimerMonCompteAction}
      >
        <MonProfilPage
          identite={identiteDuProfil(user)}
          sections={{
            contrats:
              contrat === null ? null : (
                <CarteContrat
                  contrat={contrat}
                  coordinateur={user.coordinateur !== null}
                />
              ),
            mediation: visibles.mediation ? (
              <CarteMediationNumerique active={user.mediateur !== null} />
            ) : null,
            suppression: visibles.suppression ? (
              <CarteSupprimerMonCompte />
            ) : null,
          }}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default MonProfil
