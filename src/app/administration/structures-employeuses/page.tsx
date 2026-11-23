import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateAdmin } from '@/features/authentification/implementation/session/authenticateUser'
import EmployeusesListePage from '@/features/employeuse/abilities/lister-employeuses/ui/pages/EmployeusesListePage'
import {
  criteresListeEmployeuses,
  type EmployeusesSearchParams,
  employeuseAffichee,
  etatDeTableEmployeuses,
  listerEmployeuses,
} from '@/features/employeuse/server'

export const metadata = {
  title: metadataTitle('Structures employeuses'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  searchParams: Promise<EmployeusesSearchParams>
}) => {
  await authenticateAdmin()
  const searchParams = await props.searchParams
  const criteres = criteresListeEmployeuses(searchParams)

  const { employeuses, total } = await listerEmployeuses(criteres)

  return (
    <EmployeusesListePage
      employeuses={employeuses.map(employeuseAffichee)}
      trouvees={total}
      parPage={criteres.parPage}
      state={etatDeTableEmployeuses(searchParams)}
    />
  )
}

export default Page
