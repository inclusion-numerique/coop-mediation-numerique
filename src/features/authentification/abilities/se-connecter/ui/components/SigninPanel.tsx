import { Route } from 'next'
import ProConnectSigninButton from '@/features/authentification/abilities/se-connecter/ui/components/ProConnectSigninButton'
import { EmailSigninForm } from '@/features/authentification/abilities/se-connecter/ui/forms/EmailSigninForm'
import { messageDErreurDeConnexion } from '@/features/authentification/abilities/se-connecter/ui/labels/erreur-de-connexion.labels'
import { AuthCard } from '@/features/authentification/ui/components/AuthCard'
import { LogoCoop } from '@/libraries/ui/components'

export type AffichageDeLaConnexion =
  | { readonly via: 'proconnect'; readonly fournisseur: string }
  | { readonly via: 'courriel'; readonly branchePreview: string | null }

const SigninPanel = ({
  error,
  callbackUrl,
  connexion,
}: {
  error?: string | undefined
  callbackUrl: Route
  connexion: AffichageDeLaConnexion
}) => (
  <AuthCard>
    <div className="fr-flex fr-width-full fr-justify-content-center">
      <LogoCoop />
    </div>
    {connexion.via === 'proconnect' && (
      <p className="fr-text--xl fr-text--center fr-mb-0 fr-mt-8v">
        Accédez à ce service grâce à <strong>ProConnect</strong>, votre
        identifiant unique pour accéder à plusieurs services de l’État.
      </p>
    )}
    {connexion.via === 'courriel' && (
      <p className="fr-text--xl fr-text--center fr-mb-0 fr-mt-8v">
        Connexion par réception d’un lien unique par email
      </p>
    )}

    {error ? (
      <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-6v">
        <p>{messageDErreurDeConnexion(error)}</p>
      </div>
    ) : null}
    {connexion.via === 'proconnect' && (
      <ProConnectSigninButton
        className="fr-mt-8v"
        callbackUrl={callbackUrl}
        fournisseur={connexion.fournisseur}
      />
    )}
    {connexion.via === 'courriel' && (
      <>
        {connexion.branchePreview !== null && (
          <p>
            La connexion avec ProConnect est uniquement disponible sur les
            environnement de production <i>main</i> et de recette <i>dev</i>.
            <br />
            <br />
            Sur cette environnement de preview <i>{connexion.branchePreview}</i>
            , vous pouvez vous connecter avec votre email.
          </p>
        )}
        <EmailSigninForm callbackUrl={callbackUrl} />
      </>
    )}
  </AuthCard>
)

export default SigninPanel
