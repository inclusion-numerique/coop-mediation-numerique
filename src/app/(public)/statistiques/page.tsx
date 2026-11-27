import { unstable_cache } from 'next/cache'
import { lireLesAccompagnements } from '@/features/legal/abilities/consulter-les-statistiques-publiques/implementations/prisma/accompagnements.query'
import { lireLesBeneficiaires } from '@/features/legal/abilities/consulter-les-statistiques-publiques/implementations/prisma/beneficiaires.query'
import { suiviDesBeneficiaires } from '@/features/legal/abilities/consulter-les-statistiques-publiques/implementations/prisma/suivi-des-beneficiaires.query'
import { default as StatistiquesPubliquesPage } from '@/features/legal/abilities/consulter-les-statistiques-publiques/ui/pages/StatistiquesPubliquesPage'
import { utilisateursActifsPresentes } from '@/features/legal/abilities/consulter-les-statistiques-publiques/ui/presenters/utilisateurs-actifs.presenter'
import { mesurerLesUtilisateursActifs } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs.query'
import { utilisateursActifsParMois } from '@/features/utilisateurs/abilities/mesurer-les-utilisateurs-actifs/implementations/prisma/utilisateurs-actifs-par-mois.query'

const statistiquesPubliques = async () => {
  const [
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    parMois,
  ] = await Promise.all([
    mesurerLesUtilisateursActifs(new Date()),
    lireLesAccompagnements(),
    lireLesBeneficiaires(),
    suiviDesBeneficiaires(),
    utilisateursActifsParMois(),
  ])
  return {
    chiffresCles,
    accompagnements,
    beneficiaires,
    suiviBeneficiaires,
    utilisateursActifs: utilisateursActifsPresentes({
      actifs: chiffresCles,
      parMois,
    }),
  }
}

const statistiquesEnCache = unstable_cache(
  statistiquesPubliques,
  ['statistiques-publiques'],
  { revalidate: 3600 },
)

const Page = async () => (
  <StatistiquesPubliquesPage {...(await statistiquesEnCache())} />
)

export default Page
