import { notFound, redirect } from 'next/navigation'
import { cheminDeDuplicationIndividuelle } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters/page-de-saisie.presenter'
import { activiteDeMediationLue } from '@/features/activites/implementations/prisma/activite-de-mediation-lue.query'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/domain/consulter-employeuse-a-une-date'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import { lireLEmploiActuel } from '@/features/employeuse/implementations/prisma/emploi-actuel.query'
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

  const maintenant = new Date()
  const { data: employeuse } = await consulterEmployeuseAUneDate({
    lireLEmploiActuel,
  })({
    utilisateurId: UtilisateurIdDeLEmployeuse(user.id),
    date: maintenant,
    maintenant,
  })

  if (!employeuse) {
    return (
      <RattacherEmployeusePage
        motif="Enregistrer une activité"
        formulaire={<RattacherEmployeuseForm nextStepPath={null} />}
      />
    )
  }

  const chemin = await cheminDeDuplicationIndividuelle({
    id,
    mediateurId: user.mediateur.id,
    activiteLue: activiteDeMediationLue(rendezVousLies),
    retour,
  })

  return chemin === null ? notFound() : redirect(chemin)
}

export default DupliquerPage
