import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import BackButton from '@app/web/components/BackButton'
import ImportBeneficiairesAnalyseContent, {
  type ImporterBeneficiaires,
} from '../components/ImportBeneficiairesAnalyseContent'

export const ImporterBeneficiairesAnalysePage = ({
  analysisId,
  importer,
}: {
  analysisId: string
  importer: ImporterBeneficiaires
}) => (
  <div className="fr-container fr-container--medium fr-mb-32v">
    <CoopBreadcrumbs
      parents={[
        {
          label: `Mes bénéficiaires`,
          linkProps: { href: '/coop/mes-beneficiaires' },
        },
        {
          label: `Importer des bénéficiaires`,
          linkProps: { href: '/coop/mes-beneficiaires/importer' },
        },
      ]}
      currentPage="Analyse"
    />
    <BackButton />
    <h1 className="fr-h3 fr-text-title--blue-france fr-mb-2v">
      Analyse du fichier à importer
    </h1>
    <p className="fr-text-mention--grey fr-mb-12v">
      Veuillez vérifier que la liste des bénéficiaires analysée correspond bien
      à votre fichier.
    </p>
    <ImportBeneficiairesAnalyseContent
      analysisId={analysisId}
      importer={importer}
    />
  </div>
)
