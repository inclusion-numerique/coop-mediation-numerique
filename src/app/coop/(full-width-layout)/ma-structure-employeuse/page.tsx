import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { MaStructureEmployeusePage } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/ui/pages/MaStructureEmployeusePage'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/RattacherEmployeuseForm'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/server'

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
      rattachement={<RattacherEmployeuseForm nextStepPath={null} />}
    />
  )
}

export default Page
