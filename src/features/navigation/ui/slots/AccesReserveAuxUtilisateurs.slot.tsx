import Link from 'next/link'
import type { RoleHorsCoop } from '../../domain'

export const AccesReserveAuxUtilisateurs = ({
  role,
}: {
  role: RoleHorsCoop
}) => (
  <div className="fr-mb-32v fr-p-12v fr-width-full fr-border-radius--8 fr-background-default--grey fr-mt-32v">
    <h2>
      Vous êtes connecté en tant{' '}
      {role === 'Admin'
        ? 'qu’administrateur'
        : 'que membre de l’équipe de support'}
    </h2>
    <p className="fr-text--xl">
      Vous n’avez pas accès au fonctionnalités de la coop 😬
    </p>
    <Link className="fr-link" href="/administration/usurpation">
      Accéder à l’usurpation pour accéder aux fonctionnalités de la coop en tant
      qu’utilisateur de test
      <span
        className="fr-icon-arrow-right-line fr-icon-arrow-right-line fr-icon--sm fr-ml-1w"
        aria-hidden
      />
    </Link>
  </div>
)
