import type { ReactNode } from 'react'
import type { BeneficiaireInformations } from '@/features/beneficiaire/abilities/consulter-beneficiaire/domain/consulter-beneficiaire'
import BeneficiaireCoordonnees from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireCoordonnees'
import BeneficiaireInformationsComplementaires from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireInformationsComplementaires'
import BeneficiaireNotes from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireNotes'
import BeneficiairePageNavigationBar from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiairePageNavigationBar'
import BeneficiaireThematiques, {
  type ThematiqueAbordee,
} from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireThematiques'
import { dateAsDay } from '@/libraries/date/date-as-day'

export type BeneficiaireInformationsPageData = {
  beneficiaire: BeneficiaireInformations
  thematiquesAbordees: readonly ThematiqueAbordee[]
  totalActivitesCount: number
}

// `actions` : boutons d'en-tête (modifier, supprimer) — concerns croisés
// injectés par la route-hub, l'ability reste découplée.
const ViewBeneficiaireInformationsPage = ({
  data: { beneficiaire, thematiquesAbordees, totalActivitesCount },
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
        <div>{actions}</div>
      </div>
      <BeneficiaireThematiques thematiques={thematiquesAbordees} />
      <BeneficiaireCoordonnees beneficiaire={beneficiaire} />
      <BeneficiaireInformationsComplementaires beneficiaire={beneficiaire} />
      <BeneficiaireNotes notes={beneficiaire.notes} />
    </div>
  </>
)

export default ViewBeneficiaireInformationsPage
