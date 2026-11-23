import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/implementations/session/authenticateUser'
import {
  communesDesLieux,
  lieuxDuDepartement,
} from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import {
  hrefDuLieuEnListe,
  LieuActiviteCard,
} from '@/features/lieux-activite/ui'
import {
  consulterLesLieuxDuDepartement,
  type ParametresDesLieux,
} from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement'
import { LieuxDuDepartementPage } from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/ui'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
    { lieuxDuDepartement, communesDesLieux },
  )

  return consultation.success ? (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <LieuxDuDepartementPage
        {...consultation.data}
        communes={[...consultation.data.communes]}
        listeDesLieux={consultation.data.lieux.lieux.map((lieu) => (
          <LieuActiviteCard
            key={lieu.id}
            lieu={lieu}
            href={hrefDuLieuEnListe(lieu)}
          />
        ))}
      />
    </ClientBinder>
  ) : (
    notFound()
  )
}

export default Page
