import { BeneficiaireInformationsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/getBeneficiaireInformationsPageData'
import { DeleteBeneficiaireModal } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/DeleteBeneficiaireModal'
import BeneficiaireCoordonnees from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireCoordonnees'
import BeneficiaireInformationsComplementaires from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireInformationsComplementaires'
import BeneficiaireNotes from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireNotes'
import BeneficiairePageNavigationBar from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiairePageNavigationBar'
import BeneficiaireThematiques from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/components/BeneficiaireThematiques'
import { dateAsDay } from '@app/web/utils/dateAsDay'
import Button from '@codegouvfr/react-dsfr/Button'

const ViewBeneficiaireInformationsPage = ({
  data: { beneficiaire, thematiquesCounts, totalActivitesCount },
}: {
  data: BeneficiaireInformationsPageData
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
        <div>
          <Button
            iconId="fr-icon-edit-line"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            linkProps={{
              href: `/coop/mes-beneficiaires/${beneficiaire.id}/modifier`,
            }}
          >
            Modifier
          </Button>
          <Button
            iconId="fr-icon-delete-bin-line"
            className="fr-ml-1v"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            type="button"
            {...DeleteBeneficiaireModal.buttonProps}
          >
            Supprimer
          </Button>
        </div>
      </div>
      <BeneficiaireThematiques thematiquesCounts={thematiquesCounts} />
      <BeneficiaireCoordonnees beneficiaire={beneficiaire} />
      <BeneficiaireInformationsComplementaires beneficiaire={beneficiaire} />
      <BeneficiaireNotes notes={beneficiaire.notes} />
    </div>
  </>
)

export default ViewBeneficiaireInformationsPage
