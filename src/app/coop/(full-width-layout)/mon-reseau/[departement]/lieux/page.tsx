import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { rechercherDesCommunesDuReseauAction } from '@/app/_actions/mon-reseau/rechercher-des-communes-du-reseau.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { communesDesLieux } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/communes-des-lieux.query'
import { lieuxDuDepartement } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/lieux-du-departement.query'
import { RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY } from '@/features/lieux-activite/abilities/rechercher-un-lieu-activite/action/rechercher-un-lieu-activite.key'
import { hrefDuLieuEnListe } from '@/features/lieux-activite/ui/presenters/href-du-lieu.presenter'
import { default as LieuActiviteCard } from '@/features/lieux-activite/ui/slots/LieuActiviteCard.slot'
import { consulterLesLieuxDuDepartement } from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/domain/consulter-les-lieux-du-departement'
import {
  criteresDesLieuxDuReseau,
  filtresDesLieuxDuReseau,
  pagesDesLieuxDuReseau,
} from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/ui/filtres/lieux-du-reseau.filtre'

import { default as LieuxDuDepartementPage } from '@/features/mon-reseau/abilities/consulter-les-lieux-du-departement/ui/pages/LieuxDuDepartementPage'
import { RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY } from '@/features/mon-reseau/action/rechercher-des-communes-du-reseau.key'
import type { ParametresDuReseau } from '@/features/mon-reseau/ui/filtres/reseau.filtre'
import { barreDuReseau } from '@/features/mon-reseau/ui/presenters/barre-du-reseau.presenter'
import { hrefDesLieux } from '@/features/mon-reseau/ui/presenters/liens.presenter'
import { departementConnu } from '@/libraries/departement'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle("Annuaire des lieux d'activités"),
}

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ departement: string }>
  searchParams: Promise<ParametresDuReseau>
}) => {
  await authenticateMediateurOrCoordinateur()

  const { departement } = await params
  const parametres = await searchParams
  const consultation = await consulterLesLieuxDuDepartement({
    lieuxDuDepartement,
    communesDesLieux,
  })({
    departement: departementConnu(departement),
    criteres: criteresDesLieuxDuReseau(parametres),
  })

  return consultation.success ? (
    <ClientBinder
      bind={RECHERCHER_UN_LIEU_ACTIVITE_ACTION_KEY}
      to={rechercherUnLieuActiviteAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY}
        to={rechercherDesCommunesDuReseauAction.bind(null, departement)}
      >
        <LieuxDuDepartementPage
          {...consultation.data}
          barre={barreDuReseau({
            filtres: filtresDesLieuxDuReseau,
            adresse: { chemin: hrefDesLieux(departement), parametres },
            communes: consultation.data.communes.communesOptions,
          })}
          pages={pagesDesLieuxDuReseau(
            { chemin: hrefDesLieux(departement), parametres },
            consultation.data.lieux,
          )}
          listeDesLieux={consultation.data.lieux.items.map((lieu) => (
            <LieuActiviteCard
              key={lieu.id}
              lieu={lieu}
              href={hrefDuLieuEnListe(lieu)}
            />
          ))}
        />
      </ClientBinder>
    </ClientBinder>
  ) : (
    notFound()
  )
}

export default Page
