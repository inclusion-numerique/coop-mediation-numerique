import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { rechercherUneStructureEmployeuseAction } from '@/app/_actions/employeuse/rechercher-une-structure-employeuse.action'
import { renseignerStructureEmployeuseAction } from '@/app/_actions/employeuse/renseigner-structure-employeuse.action'
import { metadataTitle } from '@/configuration/projet'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/domain/consulter-employeuse-a-une-date'
import { MaStructureEmployeusePage } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/ui/pages/MaStructureEmployeusePage'
import { RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/rechercher-une-structure-employeuse.key'
import { RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/action/renseigner-structure-employeuse.key'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import { lireLEmploiActuel } from '@/features/employeuse/implementations/prisma/emploi-actuel.query'
import { emploiEmployeuseAffichage } from '@/features/employeuse/ui/presenters/employeuse-emploi.presenter'
import ActeurStructureEmployeuse from '@/features/employeuse/ui/slots/ActeurStructureEmployeuse.slot'
import { ClientBinder } from '@/libraries/nextjs/injection'

export const metadata: Metadata = {
  title: metadataTitle('Ma structure employeuse'),
}

const Page = async () => {
  const user = await authenticateUser()

  if (!user.mediateur && !user.coordinateur) {
    return redirect('/')
  }

  const maintenant = new Date()
  const { data: employeuse } = await consulterEmployeuseAUneDate({
    lireLEmploiActuel,
  })({
    utilisateurId: UtilisateurIdDeLEmployeuse(user.id),
    date: maintenant,
    maintenant,
  })

  return (
    <MaStructureEmployeusePage
      structure={
        employeuse ? (
          <ActeurStructureEmployeuse
            emploi={{ structure: emploiEmployeuseAffichage(employeuse) }}
            showIsLieuActiviteNotice={false}
            showReferentStructure={true}
            showReferentStructureConseillerNumeriqueSupportNotice={false}
          />
        ) : null
      }
      rattachement={
        <ClientBinder
          bind={RENSEIGNER_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
          to={renseignerStructureEmployeuseAction}
        >
          <ClientBinder
            bind={RECHERCHER_UNE_STRUCTURE_EMPLOYEUSE_ACTION_KEY}
            to={rechercherUneStructureEmployeuseAction}
          >
            <RattacherEmployeuseForm nextStepPath={null} />
          </ClientBinder>
        </ClientBinder>
      }
    />
  )
}

export default Page
