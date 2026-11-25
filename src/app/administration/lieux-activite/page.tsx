import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { rechercherDesLieux } from '@/features/lieux-activite/abilities/lister-tous-les-lieux/implementations/prisma/rechercher-des-lieux.query'
import {
  criteresDeLaListe,
  liensDeLaListe,
} from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui/filtres/liste-des-lieux.filtre'
import { LieuxPage } from '@/features/lieux-activite/abilities/lister-tous-les-lieux/ui/pages/LieuxPage'

export const metadata = {
  title: metadataTitle('Lieux d’activité'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  await authenticateAdmin()
  const parametres = await props.searchParams
  const lieux = await rechercherDesLieux(criteresDeLaListe(parametres))

  return <LieuxPage lieux={lieux} liens={liensDeLaListe(parametres, lieux)} />
}

export default Page
