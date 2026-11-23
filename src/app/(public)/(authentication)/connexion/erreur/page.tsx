import { ErreurDeConnexionPage } from '@/features/authentification/abilities/se-connecter/ui/pages/ErreurDeConnexionPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ErrorPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) => {
  const { error } = await searchParams
  return <ErreurDeConnexionPage error={error} />
}

export default ErrorPage
