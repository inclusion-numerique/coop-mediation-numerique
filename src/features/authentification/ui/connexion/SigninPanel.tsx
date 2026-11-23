import { Route } from 'next'
import { branche, estPreview } from '@/configuration/projet/deploiement'
import {
  authenticationViaEmailMagicLink,
  authenticationViaProconnect,
} from '@/features/authentification/implementations/next-auth/authentication-provider'
import { AuthCard } from '@/features/authentification/ui/AuthCard'
import { EmailSigninForm } from '@/features/authentification/ui/connexion/EmailSigninForm'
import ProConnectSigninButton from '@/features/authentification/ui/connexion/ProConnectSigninButton'
import { signinErrorMessage } from '@/features/authentification/ui/erreur-de-connexion.labels'
import LogoCoop from '@/libraries/ui/components/LogoCoop'

const SigninPanel = ({
  error,
  callbackUrl,
}: {
  error?: string
  callbackUrl: Route
}) => (
  <AuthCard>
    <div className="fr-flex fr-width-full fr-justify-content-center">
      <LogoCoop />
    </div>
    {authenticationViaProconnect && (
      <p className="fr-text--xl fr-text--center fr-mb-0 fr-mt-8v">
        Accédez à ce service grâce à <strong>ProConnect</strong>, votre
        identifiant unique pour accéder à plusieurs services de l’État.
      </p>
    )}
    {authenticationViaEmailMagicLink && (
      <p className="fr-text--xl fr-text--center fr-mb-0 fr-mt-8v">
        Connexion par réception d’un lien unique par email
      </p>
    )}

    {error ? (
      <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-6v">
        <p>{signinErrorMessage(error)}</p>
      </div>
    ) : null}
    {authenticationViaProconnect && (
      <ProConnectSigninButton className="fr-mt-8v" callbackUrl={callbackUrl} />
    )}
    {authenticationViaEmailMagicLink && (
      <>
        {estPreview && (
          <p>
            La connexion avec ProConnect est uniquement disponible sur les
            environnement de production <i>main</i> et de recette <i>dev</i>.
            <br />
            <br />
            Sur cette environnement de preview <i>{branche}</i>, vous pouvez
            vous connecter avec votre email.
          </p>
        )}
        <EmailSigninForm callbackUrl={callbackUrl} />
      </>
    )}
  </AuthCard>
)

export default SigninPanel
