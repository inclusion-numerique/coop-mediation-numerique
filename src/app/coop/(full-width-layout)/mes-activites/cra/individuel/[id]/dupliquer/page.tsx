import { notFound, redirect } from 'next/navigation'
import { cheminDeDuplicationIndividuelle } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/implementations/prisma/page-de-saisie.query'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'

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

  const chemin = await cheminDeDuplicationIndividuelle({
    id,
    mediateurId: user.mediateur.id,
    rendezVousLies,
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerPage
