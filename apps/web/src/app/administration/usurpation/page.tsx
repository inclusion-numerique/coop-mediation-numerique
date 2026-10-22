import { reinitialiserUneFixtureAction } from '@app/web/app/_actions/utilisateurs/reinitialiser-une-fixture.action'
import { usurperUnUtilisateurAction } from '@app/web/app/_actions/utilisateurs/usurper-un-utilisateur.action'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { REINITIALISER_UNE_FIXTURE_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/reinitialiser-une-fixture/action/reinitialiser-une-fixture.key'
import { BoutonReinitialiser } from '@app/web/features/utilisateurs/abilities/reinitialiser-une-fixture/ui'
import { comptesDeTest } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur'
import { USURPER_UN_UTILISATEUR_ACTION_KEY } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur/action/usurper-un-utilisateur.key'
import { UsurpationPage } from '@app/web/features/utilisateurs/abilities/usurper-un-utilisateur/ui'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'

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
