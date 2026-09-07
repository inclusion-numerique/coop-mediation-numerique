import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import RattacherEmployeuseForm from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/RattacherEmployeuseForm'
import {
  consulterEmployeuseAUneDate,
  emploiEmployeuseAffichage,
} from '@app/web/features/employeuse/server'
import ActeurStructureEmployeuse from '@app/web/features/mon-reseau/use-cases/acteurs/components/ActeurStructureEmployeuse'
import { contentId } from '@app/web/utils/skipLinks'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: metadataTitle('Ma structure employeuse'),
}

const MaStructureEmployeusePage = async () => {
  const user = await authenticateUser()

  if (!user.mediateur && !user.coordinateur) {
    return redirect('/')
  }

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })
  const emploi = employeuse
    ? { structure: emploiEmployeuseAffichage(employeuse) }
    : null

  return (
    <>
      <SkipLinksPortal />
      <div className="fr-container fr-container--800">
        <CoopBreadcrumbs currentPage="Ma structure employeuse" />
        <main id={contentId} className="fr-mb-16w">
          <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
            <span
              className="ri-home-smile-2-line ri-xl fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
              aria-hidden
            />
            <h1 className="fr-page-title fr-m-0">Ma structure employeuse</h1>
          </div>

          {emploi ? (
            <ActeurStructureEmployeuse
              emploi={emploi}
              showIsLieuActiviteNotice={false}
              showReferentStructure={true}
              showReferentStructureConseillerNumeriqueSupportNotice={false}
              canUpdateStructure={user.isConseillerNumerique}
            />
          ) : (
            <div className="fr-background-alt--blue-france fr-border-radius--8 fr-p-6w">
              <h2 className="fr-h6 fr-mb-1v">
                Vous n’avez pas de structure employeuse
              </h2>
              <p className="fr-text--sm fr-text-mention--grey fr-mb-6v">
                Sans elle, vous ne pouvez pas enregistrer d’activité. Recherchez
                votre structure par son nom, son SIRET ou son adresse.
              </p>
              <RattacherEmployeuseForm nextStepPath={null} />
            </div>
          )}
        </main>
      </div>
    </>
  )
}

export default MaStructureEmployeusePage
