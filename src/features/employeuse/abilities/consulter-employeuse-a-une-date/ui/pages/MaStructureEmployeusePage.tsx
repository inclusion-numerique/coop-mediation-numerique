import type { ReactNode } from 'react'
import { contentId } from '@/libraries/liens-d-evitement'
import { SkipLinksPortal } from '@/libraries/liens-d-evitement/composants'
import { CoopBreadcrumbs } from '@/libraries/ui/components'
import type { Employeuse } from '../../../../domain/employeuse'
import { emploiEmployeuseAffichage } from '../../../../ui/presenters/employeuse-emploi.presenter'
import ActeurStructureEmployeuse from '../../../../ui/slots/ActeurStructureEmployeuse.slot'

export const MaStructureEmployeusePage = ({
  employeuse,
  rattachement,
}: {
  employeuse: Employeuse | null
  rattachement: ReactNode
}) => (
  <>
    <SkipLinksPortal />
    <div className="fr-container fr-container--800">
      <CoopBreadcrumbs currentPage="Ma structure employeuse" />
      <main id={contentId} className="fr-mb-16w">
        <div className="fr-flex fr-flex-wrap fr-direction-row fr-align-items-center fr-flex-gap-4v fr-my-12v">
          <span
            className="ri-home-smile-2-line fr-line-height-1 fr-text-label--blue-france fr-background-alt--blue-france fr-p-2w fr-m-0 fr-border-radius--8"
            aria-hidden
          />
          <h1 className="fr-page-title fr-m-0">Ma structure employeuse</h1>
        </div>

        {employeuse ? (
          <ActeurStructureEmployeuse
            emploi={{ structure: emploiEmployeuseAffichage(employeuse) }}
            showIsLieuActiviteNotice={false}
            showReferentStructure={true}
            showReferentStructureConseillerNumeriqueSupportNotice={false}
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
            {rattachement}
          </div>
        )}
      </main>
    </div>
  </>
)
