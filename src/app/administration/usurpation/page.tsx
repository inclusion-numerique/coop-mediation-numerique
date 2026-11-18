import { reinitialiserUneFixtureAction } from '@/app/_actions/utilisateurs/reinitialiser-une-fixture.action'
import { usurperUnUtilisateurAction } from '@/app/_actions/utilisateurs/usurper-un-utilisateur.action'
import { metadataTitle } from '@/app/metadataTitle'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
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

const Page = async () => (
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
        usurpationLibre={ServerWebAppConfig.Sudo.usurpation}
        enProduction={PublicWebAppConfig.isMain}
        reinitialiser={(utilisateurId) => (
          <BoutonReinitialiser utilisateurId={utilisateurId} />
        )}
      />
    </ClientBinder>
  </ClientBinder>
)

export default Page
