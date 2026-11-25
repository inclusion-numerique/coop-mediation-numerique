import { unstable_cache } from 'next/cache'
import { statistiquesPubliques } from '@/features/legal/abilities/consulter-les-statistiques-publiques/implementations/prisma/statistiques-publiques.query'
import { default as StatistiquesPubliquesPage } from '@/features/legal/abilities/consulter-les-statistiques-publiques/ui/pages/StatistiquesPubliquesPage'
import { mesurerLesUtilisateursActifs } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs.query'
import { utilisateursActifsParMois } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs-par-mois.query'

const statistiquesEnCache = unstable_cache(
  () =>
    statistiquesPubliques({
      mesurerLesUtilisateursActifs,
      utilisateursActifsParMois,
    }),
  ['statistiques-publiques'],
  { revalidate: 3600 },
)

const Page = async () => (
  <StatistiquesPubliquesPage {...(await statistiquesEnCache())} />
)

export default Page
