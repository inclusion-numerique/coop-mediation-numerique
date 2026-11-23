import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticate-user'
import { communesDesLieux } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/communes-des-lieux.query'
import { type ParametresDesActeurs } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/domain/index'
import { listerLesActeursDuDepartement } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma/acteurs-listes.query'
import { default as ActeursDuDepartementPage } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/ui/pages/ActeursDuDepartementPage'

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
    { communesDesLieux },
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
