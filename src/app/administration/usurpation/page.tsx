import { reinitialiserUneFixtureAction } from '@/app/_actions/utilisateurs/reinitialiser-une-fixture.action'
import { usurperUnUtilisateurAction } from '@/app/_actions/utilisateurs/usurper-un-utilisateur.action'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { estMain, metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { REINITIALISER_UNE_FIXTURE_ACTION_KEY } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.key'
import { BoutonReinitialiser } from '@/features/utilisateurs/abilities/reinitialiser-une-fixture/ui/slots/BoutonReinitialiser.slot'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.key'
import { comptesDeTest } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/implementations/prisma/cible-usurpation.query'
import { UsurpationPage } from '@/features/utilisateurs/abilities/usurper-un-utilisateur/ui/pages/UsurpationPage'
import { ClientBinder } from '@/libraries/nextjs/injection'

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
          usurpationLibre={environnementServeur().SUDO_USURPATION}
          enProduction={estMain()}
          reinitialiser={(utilisateurId) => (
            <BoutonReinitialiser utilisateurId={utilisateurId} />
          )}
        />
      </ClientBinder>
    </ClientBinder>
  )
}

export default Page
