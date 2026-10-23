import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@app/web/auth/authenticateUser'
import {
  consulterLesActeursDuDepartement,
  type ParametresDesActeurs,
} from '@app/web/features/mon-reseau/abilities/lister-les-acteurs-du-departement'
import { ActeursDuDepartementPage } from '@app/web/features/mon-reseau/abilities/lister-les-acteurs-du-departement/ui'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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

  const parametres = await searchParams
  const consultation = await consulterLesActeursDuDepartement(
    (await params).departement,
    parametres,
  )

  return consultation.success ? (
    <ActeursDuDepartementPage
      {...consultation.data}
      communes={[...consultation.data.communes]}
      parametres={parametres}
    />
  ) : (
    notFound()
  )
}

export default Page
