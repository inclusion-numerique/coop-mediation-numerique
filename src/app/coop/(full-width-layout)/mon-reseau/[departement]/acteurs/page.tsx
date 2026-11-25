import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { rechercherDesCommunesDuReseauAction } from '@/app/_actions/mon-reseau/rechercher-des-communes-du-reseau.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateMediateurOrCoordinateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { communesDesLieux } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/communes-des-lieux.query'
import { listerLesActeursDuDepartement } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/implementations/prisma/acteurs-listes.query'
import {
  criteresDesActeursDuReseau,
  filtresDesActeursDuReseau,
  pagesDesActeursDuReseau,
} from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/ui/filtres/acteurs-du-reseau.filtre'

import { default as ActeursDuDepartementPage } from '@/features/mon-reseau/abilities/lister-les-acteurs-du-departement/ui/pages/ActeursDuDepartementPage'
import { RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY } from '@/features/mon-reseau/action/rechercher-des-communes-du-reseau.key'
import type { ParametresDuReseau } from '@/features/mon-reseau/ui/filtres/reseau.filtre'
import { barreDuReseau } from '@/features/mon-reseau/ui/presenters/barre-du-reseau.presenter'
import { hrefDesActeurs } from '@/features/mon-reseau/ui/presenters/liens.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Annuaire des acteurs'),
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
  const consultation = await listerLesActeursDuDepartement(
    departement,
    criteresDesActeursDuReseau(parametres),
    { communesDesLieux },
  )

  return consultation.success ? (
    <ClientBinder
      bind={RECHERCHER_DES_COMMUNES_DU_RESEAU_KEY}
      to={rechercherDesCommunesDuReseauAction.bind(null, departement)}
    >
      <ActeursDuDepartementPage
        {...consultation.data}
        barre={barreDuReseau({
          filtres: filtresDesActeursDuReseau,
          adresse: { chemin: hrefDesActeurs(departement), parametres },
          communes: consultation.data.communes,
        })}
        pages={pagesDesActeursDuReseau(
          { chemin: hrefDesActeurs(departement), parametres },
          consultation.data.acteurs,
        )}
      />
    </ClientBinder>
  ) : (
    notFound()
  )
}

export default Page
