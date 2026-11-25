import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { listerEmployeuses } from '@/features/employeuse/abilities/lister-employeuses/implementations/prisma/lister-employeuses.query'
import { listeDesEmployeuses } from '@/features/employeuse/abilities/lister-employeuses/ui/filtres/liste-des-employeuses.filtre'
import EmployeusesListePage from '@/features/employeuse/abilities/lister-employeuses/ui/pages/EmployeusesListePage'
import { barreDesEmployeuses } from '@/features/employeuse/abilities/lister-employeuses/ui/presenters/barre-des-employeuses.presenter'
import { employeuseAffichee } from '@/features/employeuse/abilities/lister-employeuses/ui/presenters/employeuse-affichee.presenter'

export const metadata = {
  title: metadataTitle('Structures employeuses'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) => {
  await authenticateAdmin()
  const parametres = await props.searchParams
  const { recherche, tri, pagination } = listeDesEmployeuses.charger(parametres)

  const resultat = await listerEmployeuses({ recherche, tri, ...pagination })

  return (
    <EmployeusesListePage
      employeuses={resultat.items.map(employeuseAffichee)}
      trouvees={resultat.totalItems}
      barre={barreDesEmployeuses(parametres, resultat)}
    />
  )
}

export default Page
