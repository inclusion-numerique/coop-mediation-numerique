import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { rechercherStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/employeuse/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import { MaStructureEmployeusePage } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/ui/pages/MaStructureEmployeusePage'
import { RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-structure-employeuse.key'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.key'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/forms/RattacherEmployeuseForm'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Ma structure employeuse'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur && !user.coordinateur) {
    return redirect('/')
  }

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  return (
    <MaStructureEmployeusePage
      employeuse={employeuse}
      rattachement={
        <ClientBinder
          bind={RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
          to={renseignerStructureEmployeuseAction}
        >
          <ClientBinder
            bind={RECHERCHER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
            to={rechercherStructureEmployeuseAction}
          >
            <RattacherEmployeuseForm nextStepPath={null} />
          </ClientBinder>
        </ClientBinder>
      }
    />
  )
}

export default Page
