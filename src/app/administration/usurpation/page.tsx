import { reinitialiserUneFixtureAction } from '@/app/_actions/utilisateurs/reinitialiser-une-fixture.action'
import { usurperUnUtilisateurAction } from '@/app/_actions/utilisateurs/usurper-un-utilisateur.action'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { estMain } from '@/configuration/projet/deploiement'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticateUser'
import { REINITIALISER_UNE_FIXTURE_ACTION_KEY } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.key'
import { BoutonReinitialiser } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/ui'
import { comptesDeTest } from '@/features/utilisateurs/abilities/usurper-un-utilisateur'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.key'
import { UsurpationPage } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

export const metadata = {
  title: metadataTitle('Usurpation'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async () => {
  await authenticateAdmin()
  return (
    <ClientBinder
      bind={USURPER_UN_UTILISATEUR_ACTION_KEY}
      to={usurperUnUtilisateurAction}
    >
      <ClientBinder
        bind={REINITIALISER_UNE_FIXTURE_ACTION_KEY}
        to={reinitialiserUneFixtureAction}
      >
        <UsurpationPage
          comptesDeTest={await comptesDeTest()}
          usurpationLibre={environnementServeur.SUDO_USURPATION}
          enProduction={estMain}
          reinitialiser={(utilisateurId) => (
            <BoutonReinitialiser utilisateurId={utilisateurId} />
          )}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
