import { metadataTitle } from '@app/web/app/metadataTitle'
import {
  consulterEmployeuse,
  EmployeuseId,
  employeuseConsulteeAffichage,
} from '@app/web/features/employeuse'
import EmployeusePage from '@app/web/features/employeuse/abilities/consulter-employeuse/ui/pages/EmployeusePage'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Structure employeuse'),
}
export const dynamic = 'force-dynamic'
export const revalidate = 0

const Page = async (props: {
  params: Promise<{ structureAdministrativeId: string }>
}) => {
  const { structureAdministrativeId } = await props.params

  // Le segment de route porte l'identifiant `main` (entier) : tout le reste ne
  // désigne aucune employeuse.
  const employeuseId = EmployeuseId.safe(Number(structureAdministrativeId))
  if (!employeuseId) return notFound()

  const employeuse = await consulterEmployeuse({ employeuseId })
  if (!employeuse) return notFound()

  return (
    <EmployeusePage employeuse={employeuseConsulteeAffichage(employeuse)} />
  )
}

export default Page
