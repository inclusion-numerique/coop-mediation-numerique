import Link from 'next/link'
import { projectTitle } from '@/configuration/projet'
import { connexionImpossibleMessage } from '@/features/authentification/abilities/se-connecter/ui/labels/erreur-de-connexion.labels'
import { AuthCard } from '@/features/authentification/ui/components/AuthCard'
import { Breadcrumbs } from '@/libraries/ui/components'

export const ErreurDeConnexionPage = ({
  error,
}: {
  error?: string | undefined
}) => (
  <>
    <Breadcrumbs
      currentPage="Erreur"
      parents={[{ label: 'Connexion', linkProps: { href: '/connexion' } }]}
    />
    <AuthCard>
      <h2 style={{ textAlign: 'center' }} className="fr-mb-12v">
        Connexion à {projectTitle()}
      </h2>
      <div className="fr-alert fr-alert--error fr-alert--sm fr-mb-6v">
        <h6>Connexion impossible</h6>
        <p>{connexionImpossibleMessage(error)}</p>
      </div>

      <ul className="fr-btns-group fr-mt-12v">
        <li>
          <Link href="/connexion" target="_self" className="fr-btn">
            Retour
          </Link>
        </li>
      </ul>
    </AuthCard>
  </>
)
