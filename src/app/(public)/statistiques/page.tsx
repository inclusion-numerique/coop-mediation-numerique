import {
  getStatistiquesPubliquesPageData,
  StatistiquesPubliquesPage,
} from '@/features/legal/abilities/consulter-les-statistiques-publiques'
import {
  mesurerLesUtilisateursActifs,
  utilisateursActifsParMois,
} from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs'

const Page = async () => (
  <StatistiquesPubliquesPage
    {...(await getStatistiquesPubliquesPageData({
      mesurerLesUtilisateursActifs,
      utilisateursActifsParMois,
    }))}
  />
)

export default Page
