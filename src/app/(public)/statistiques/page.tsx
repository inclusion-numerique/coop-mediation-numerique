import {
  getStatistiquesPubliquesPageData,
  StatistiquesPubliquesPage,
} from '@/features/legal/abilities/consulter-les-statistiques-publiques'

const Page = async () => (
  <StatistiquesPubliquesPage {...(await getStatistiquesPubliquesPageData())} />
)

export default Page
