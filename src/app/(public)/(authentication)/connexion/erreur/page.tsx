import Link from 'next/link'
import { projectTitle } from '@/configuration/projet/config'
import { connexionImpossibleMessage } from '@/features/authentification/ui/labels/erreur-de-connexion.labels'
import { AuthCard } from '@/features/authentification/ui/pages/AuthCard'
import Breadcrumbs from '@/libraries/ui/components/Breadcrumbs'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ErrorPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) => {
  const { error } = await searchParams
  return (
    <>
      <Breadcrumbs
        currentPage="Erreur"
        parents={[{ label: 'Connexion', linkProps: { href: '/connexion' } }]}
      />
      <AuthCard>
        <h2 style={{ textAlign: 'center' }} className="fr-mb-12v">
          Connexion à {projectTitle}
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
}

export default ErrorPage
