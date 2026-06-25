import type { CraThematiqueCount } from '@app/web/features/activites/use-cases/list/db/countThematiques'
import type { BeneficiaireInformations } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/domain/consulter-beneficiaire'
import BeneficiaireCoordonnees from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireCoordonnees'
import BeneficiaireInformationsComplementaires from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireInformationsComplementaires'
import BeneficiaireNotes from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireNotes'
import BeneficiairePageNavigationBar from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiairePageNavigationBar'
import BeneficiaireThematiques from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireThematiques'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { ReactNode } from 'react'

export type BeneficiaireInformationsPageData = {
  beneficiaire: BeneficiaireInformations
  thematiquesCounts: CraThematiqueCount[]
  totalActivitesCount: number
}

// `actions` : boutons d'en-tête (modifier, supprimer) — concerns croisés
// injectés par la route-hub, l'ability reste découplée.
const ViewBeneficiaireInformationsPage = ({
  data: { beneficiaire, thematiquesCounts, totalActivitesCount },
  actions,
}: {
  data: BeneficiaireInformationsPageData
  actions?: ReactNode
}) => (
  <>
    <BeneficiairePageNavigationBar
      beneficiaireId={beneficiaire.id}
      accompagnementsCount={totalActivitesCount}
      current="informations"
    />
    <div className="fr-border-radius--8 fr-border fr-mt-6v fr-mb-10v">
      <div className="fr-border--bottom fr-py-6v fr-px-8v fr-flex fr-flex-gap-6v fr-align-items-center fr-justify-content-space-between">
        <div>
          <h3 className="fr-h6 fr-mb-0">Informations bénéficiaire</h3>
          <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
            Créé le {dateAsDay(beneficiaire.creation)}
          </p>
        </div>
        {actions}
      </div>
      <BeneficiaireThematiques thematiquesCounts={thematiquesCounts} />
      <BeneficiaireCoordonnees beneficiaire={beneficiaire} />
      <BeneficiaireInformationsComplementaires beneficiaire={beneficiaire} />
      <BeneficiaireNotes notes={beneficiaire.notes} />
    </div>
  </>
)

export default ViewBeneficiaireInformationsPage
