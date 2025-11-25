import { metadataTitle } from '@app/web/app/metadataTitle'
import { statutCompte } from '@app/web/features/utilisateurs/use-cases/list/statut-compte'
import { notFound } from 'next/navigation'
import AdministrationUserPage from './AdministrationUserPage'
import { getAdministrationUserPageData } from './getAdministrationUserPageData'

export const metadata = {
  title: metadataTitle('Utilisateurs - Détails'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params

  const { id } = params

  const data = await getAdministrationUserPageData({ id })
  if (!data) {
    notFound()
  }

  return (
    <AdministrationUserPage
      data={{
        ...data,
        user: {
          ...data.user,
          statutCompte: statutCompte(new Date())(data.user),
        },
      }}
    />
  )
}

export default Page
