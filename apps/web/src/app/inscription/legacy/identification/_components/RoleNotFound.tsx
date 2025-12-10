import SignoutButton from '@app/web/app/(public)/(authentication)/deconnexion/SignoutButton'
import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  allProfileInscriptionLabels,
  type ProfileInscriptionSlug,
  profileInscriptionFromSlug,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import Notice from '@codegouvfr/react-dsfr/Notice'
import Link from 'next/link'
import React from 'react'
import { inscriptionRolesErrorTitles } from './inscriptionRole'

export const RoleNotFound = ({
  roleNotFound,
  user,
  proConnectIdTokenHint,
}: {
  roleNotFound: ProfileInscriptionSlug
  user: Pick<SessionUser, 'email' | 'id'>
  proConnectIdTokenHint: string | null
}) => (
  <div className="fr-flex fr-direction-column fr-flex-gap-10v">
    <div>
      <img
        src="/images/iconographie/visuel-erreur.svg"
        alt=""
        className="fr-mx-auto fr-display-block"
      />
      <h1 className="fr-h3 fr-mt-6v fr-mb-0 fr-text-title--blue-france fr-text--center">
        {inscriptionRolesErrorTitles[roleNotFound]}
      </h1>
    </div>
    <Notice
      className="fr-notice--warning fr-notice--flex fr-align-items-start"
      title={
        <span className="fr-text--regular fr-text-default--grey">
          <span className="fr-mb-2w">
            <span>
              Nous n’avons pas trouvé de profil de{' '}
              <span className="fr-text--bold">
                {allProfileInscriptionLabels[
                  profileInscriptionFromSlug[roleNotFound]
                ].toLocaleLowerCase()}
              </span>{' '}
              correspondant à l’adresse email {user.email}
            </span>
            <br />
            <span className="fr-text--sm fr-text-mention--grey">
              Source :{' '}
              <Link
                href="https://conseiller-numerique.gouv.fr"
                target="_blank"
                rel="noreferrer"
              >
                conseiller-numerique.gouv.fr
              </Link>
            </span>
          </span>
          <br />
          <br />
          <Link
            className="fr-text-label--blue-france"
            href={`mailto:${PublicWebAppConfig.contactEmail}`}
          >
            <span role="img" className="ri-mail-line fr-mr-1w" aria-hidden />
            Veuillez contacter le support
          </Link>
        </span>
      }
    />
    <p className="fr-mb-0 fr-text--center">
      Vous pouvez également essayer de retrouver votre profil en renseignant une
      autre adresse email.{' '}
      <Link
        href="https://docs.numerique.gouv.fr/docs/126f1452-8fac-4073-a86b-82e8559a1be0/"
        className="fr-link"
      >
        En savoir plus
      </Link>
    </p>
    <SignoutButton
      proConnectIdTokenHint={proConnectIdTokenHint}
      size="large"
      className="fr-width-full fr-display-block"
      callbackUrl="/connexion"
    >
      Essayer une autre adresse email
    </SignoutButton>
  </div>
)
