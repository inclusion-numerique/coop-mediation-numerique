import { metadataTitle } from '@app/web/app/metadataTitle'
import { getAdministrationRdvspUserData } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/implementation/prisma/compte-rdv-detaille.query'
import { AdministrationRdvspUserPage } from '@app/web/features/rdvsp/abilities/administrer-comptes-rdv/ui/pages/AdministrationRdvspUserPage'
import { notFound } from 'next/navigation'

export const metadata = {
  title: metadataTitle('Rendez-vous Service Public - Utilisateur'),
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params
  const data = await getAdministrationRdvspUserData({
    userId: id,
  })

  if (!data) {
    notFound()
    return null
  }

  return <AdministrationRdvspUserPage data={data} />
}

export default Page
