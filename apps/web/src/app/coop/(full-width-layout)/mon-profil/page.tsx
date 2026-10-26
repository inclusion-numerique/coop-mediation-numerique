import { activerLaMediationNumeriqueAction } from '@app/web/app/_actions/utilisateurs/activer-la-mediation-numerique.action'
import { supprimerMonCompteAction } from '@app/web/app/_actions/utilisateurs/supprimer-mon-compte.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { consulterLeContrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat'
import { CarteContrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat/ui'
import { UtilisateurId } from '@app/web/features/mediateurs/domain'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.key'
import { CarteMediationNumerique } from '@app/web/features/utilisateurs/abilities/activer-la-mediation-numerique/ui'
import { SUPPRIMER_MON_COMPTE_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/supprimer-compte/action/supprimer-compte.key'
import { CarteSupprimerMonCompte } from '@app/web/features/utilisateurs/abilities/supprimer-compte/ui'
import { MonProfilPage } from '@app/web/features/utilisateurs/ui/pages/MonProfilPage'
import { telephoneDisplayString } from '@app/web/libraries/telephone'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Mon profil'),
}

const MonProfil = async () => {
  const user = await authenticateUser()

  if (!user) return redirect('/')

  const contrat =
    user.coordinateur || user.isConseillerNumerique
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
          identite={{
            nom: user.name,
            courriel: user.email,
            telephone: user.phone ? telephoneDisplayString(user.phone) : null,
          }}
          sections={{
            contrats:
              contrat === null ? null : (
                <section className="fr-mb-4v">
                  <CarteContrat
                    contrat={contrat}
                    coordinateur={user.coordinateur !== null}
                  />
                </section>
              ),
            mediation:
              user.coordinateur === null ? null : (
                <section className="fr-mb-4v">
                  <CarteMediationNumerique active={user.mediateur !== null} />
                </section>
              ),
            suppression: user.isConseillerNumerique ? null : (
              <section className="fr-mb-4v">
                <CarteSupprimerMonCompte />
              </section>
            ),
          }}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default MonProfil
