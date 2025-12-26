import {
  lowerCaseProfileInscriptionLabels,
  type ProfileInscriptionConseillerNumeriqueType,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'

const ConseillerNumeriqueRoleNotice = ({
  conseillerNumeriqueRole,
  className,
}: {
  conseillerNumeriqueRole: ProfileInscriptionConseillerNumeriqueType
  className?: string
}) => (
  <div
    className={classNames(
      'fr-width-full fr-border-radius--8 fr-p-6v fr-my-6v fr-flex fr-align-items-center fr-flex-gap-3v fr-background-contrast--info',
      className,
    )}
  >
    <img
      alt=""
      className="flex-shrink-0"
      src="/images/iconographie/profil-conseiller-numerique.svg"
    />
    <div>
      <p className="fr-text--bold fr-mb-0">
        Vous avez été identifié en tant que{' '}
        {lowerCaseProfileInscriptionLabels[conseillerNumeriqueRole]}
      </p>
      <div className="fr-text--xs fr-mb-0 fr-text-mention--grey">
        Source&nbsp;:{' '}
        <Link
          href="https://conseiller-numerique.gouv.fr"
          target="_blank"
          rel="noreferrer"
        >
          conseiller-numerique.gouv.fr
        </Link>
      </div>
    </div>
  </div>
)

export default ConseillerNumeriqueRoleNotice
