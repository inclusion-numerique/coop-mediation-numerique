import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/auth/authenticateUser'
import {
  listerLesActeursDuDepartement,
  type ParametresDesActeurs,
} from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement'
import { ActeursDuDepartementPage } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/ui'

export const metadata: Metadata = {
  title: metadataTitle('Annuaire des acteurs'),
}

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<ParametresDesActeurs>
}) => {
  await authenticateMediateurOrCoordinateur()

  const consultation = await listerLesActeursDuDepartement(
    (await params).departement,
    await searchParams,
  )

  return consultation.success ? (
    <ActeursDuDepartementPage
      {...consultation.data}
      communes={[...consultation.data.communes]}
    />
  ) : (
    notFound()
  )
}

export default Page
