import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/app/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/auth/authenticateUser'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import {
  consulterLesLieuxDuDepartement,
  type ParametresDesLieux,
} from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement'
import { LieuxDuDepartementPage } from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/ui'
import { ClientBinder } from '@/libs/injection/client-binder'

export const metadata: Metadata = {
  title: metadataTitle("Annuaire des lieux d'activités"),
}

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<ParametresDesLieux>
}) => {
  await authenticateMediateurOrCoordinateur()

  const consultation = await consulterLesLieuxDuDepartement(
    (await params).departement,
    await searchParams,
  )

  return consultation.success ? (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <LieuxDuDepartementPage {...consultation.data} />
    </ClientBinder>
  ) : (
    notFound()
  )
}

export default Page
