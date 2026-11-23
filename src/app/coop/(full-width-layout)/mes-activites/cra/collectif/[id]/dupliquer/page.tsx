import { notFound, redirect } from 'next/navigation'
import { cheminDeDuplicationCollective } from '@/features/activites/abilities/enregistrer-un-atelier-collectif'
import { authenticateMediateur } from '@/features/authentification/implementation/session/authenticateUser'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/server'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'

const DupliquerPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams
  const user = await authenticateMediateur()

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const chemin = await cheminDeDuplicationCollective({
    id,
    mediateurId: user.mediateur.id,
    rendezVousLies,
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerPage
