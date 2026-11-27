import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { authenticateAdmin } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/domain/consulter-employeuse'
import { lireLEmployeuse } from '@/features/employeuse/abilities/consulter-employeuse/implementations/prisma/employeuse-et-ses-affectations.query'
import EmployeusePage from '@/features/employeuse/abilities/consulter-employeuse/ui/pages/EmployeusePage'
import { employeuseConsulteeAffichage } from '@/features/employeuse/abilities/consulter-employeuse/ui/presenters/employeuse-consultee.presenter'
import { EmployeuseId } from '@/features/employeuse/domain'

export const metadata: Metadata = {
  title: metadataTitle('Structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  params: Promise<{ structureAdministrativeId: string }>
}) => {
  await authenticateAdmin()
  const { structureAdministrativeId } = await props.params

  const employeuseId = EmployeuseId.safe(Number(structureAdministrativeId))
  if (!employeuseId) return notFound()

  const { data: employeuse } = await consulterEmployeuse({ lireLEmployeuse })({
    employeuseId,
  })
  if (!employeuse) return notFound()

  return (
    <EmployeusePage employeuse={employeuseConsulteeAffichage(employeuse)} />
  )
}

export default Page
