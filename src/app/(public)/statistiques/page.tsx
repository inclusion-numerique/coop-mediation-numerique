import { getStatistiquesPubliquesPageData } from '@/features/legal/abilities/consulter-les-statistiques-publiques/implementations/getStatistiquesPubliquesPageData'
import { default as StatistiquesPubliquesPage } from '@/features/legal/abilities/consulter-les-statistiques-publiques/ui/pages/StatistiquesPubliquesPage'
import { mesurerLesUtilisateursActifs } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs.query'
import { utilisateursActifsParMois } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs-par-mois.query'

const Page = async () => (
  <StatistiquesPubliquesPage
    {...(await getStatistiquesPubliquesPageData({
      mesurerLesUtilisateursActifs,
      utilisateursActifsParMois,
    }))}
  />
)

export default Page
