import { redirect } from 'next/navigation'
import { ajouterStructureEmployeuseEnLieuAction } from '@/app/_actions/inscription/ajouter-structure-employeuse-en-lieu.action'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseActuelle } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/domain/consulter-employeuse-actuelle'
import { employeuseActuelleAffichage } from '@/features/employeuse/abilities/consulter-employeuse-actuelle/ui/presenters/employeuse-actuelle.presenter'
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import { lireLEmploiActuel } from '@/features/employeuse/implementations/prisma/emploi-actuel.query'
import StructureAdministrativeCard from '@/features/employeuse/ui/slots/StructureAdministrativeCard.slot'
import { AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY } from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/action/ajouter-structure-employeuse-en-lieu.key'
import StructureEmployeuseLieuActivitePage from '@/features/inscription/abilities/ajouter-structure-employeuse-en-lieu/ui/pages/StructureEmployeuseLieuActivitePage'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle("Renseigner vos lieux d'activité"),
}

const StructureEmployeuseLieuxActivitePageRoute = async () => {
  const user = await authenticateUser()

  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  if (!user.mediateur) {
    redirect('/inscription/initialiser')
  }

  const { data: employeuseActuelle } = await consulterEmployeuseActuelle({
    lireLEmploiActuel,
  })({
    utilisateurId: UtilisateurIdDeLEmployeuse(user.id),
    maintenant: new Date(),
  })

  if (!employeuseActuelle) {
    redirect('/inscription/lieux-activite')
  }

  return (
    <ClientBinder
      bind={AJOUTER_STRUCTURE_EMPLOYEUSE_EN_LIEU_ACTION_KEY}
      to={ajouterStructureEmployeuseEnLieuAction}
    >
      <StructureEmployeuseLieuActivitePage
        carteEmployeuse={
          <StructureAdministrativeCard
            structure={employeuseActuelleAffichage(employeuseActuelle)}
          />
        }
      />
    </ClientBinder>
  )
}

export default StructureEmployeuseLieuxActivitePageRoute
