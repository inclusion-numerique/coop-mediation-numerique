import { notFound, redirect } from 'next/navigation'
import { cheminDeDuplicationCollective } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/presenters/page-de-saisie.presenter'
import { activiteDeMediationLue } from '@/features/activites/implementations/prisma/activite-de-mediation-lue.query'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
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
    return (
      <RattacherEmployeusePage
        motif="Enregistrer une activité"
        formulaire={<RattacherEmployeuseForm nextStepPath={null} />}
      />
    )
  }

  const chemin = await cheminDeDuplicationCollective({
    id,
    mediateurId: user.mediateur.id,
    activiteLue: activiteDeMediationLue(rendezVousLies),
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerPage
