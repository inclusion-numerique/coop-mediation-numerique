'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/activites/use-cases/list/components/generateActivitesFiltersLabels'
import type { ActivitesFilters } from '@app/web/features/activites/use-cases/list/validation/ActivitesFilters'
import type { BeneficiaireOption } from '@app/web/features/beneficiaires/BeneficiaireOption'
import type { LieuActiviteOption } from '@app/web/features/lieux-activite/getMediateursLieuxActiviteOptions'
import { MediateurOption } from '@app/web/mediateurs/MediateurOption'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'

const ExportStatistiquesModal = createModal({
  id: 'export-statistiques',
  isOpenedByDefault: false,
})

export const ExportStatistiques = ({
  filters,
  lieuxActiviteOptions,
  mediateursOptions,
  beneficiairesOptions,
  departementsOptions,
  communesOptions,
  tagsOptions,
  accompagnementsCount,
  activiteSourceOptions,
  exportListAccompagnements = true,
  exportStatistiques = true,
  publicExportId,
  title = 'Exports des accompagnements',
  emptyFilterMessage = 'Vous n’avez pas appliqué de filtre, tous les accompagnements seront exportés.',
}: {
  filters: ActivitesFilters
  mediateursOptions: MediateurOption[]
  beneficiairesOptions: BeneficiaireOption[]
  lieuxActiviteOptions: LieuActiviteOption[]
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
  tagsOptions: { id: string; nom: string }[]
  accompagnementsCount: number
  activiteSourceOptions: SelectOption[]
  exportListAccompagnements?: boolean
  exportStatistiques?: boolean
  publicExportId?: string
  title?: string
  emptyFilterMessage?: string
}) => {
  const exportXlsx = (exportPath: string, message: string) => {
    const searchParams = new URLSearchParams()

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      searchParams.set(key, Array.isArray(value) ? value.join(',') : value)
    }

    const pathWithSearchParams =
      searchParams.size > 0
        ? `${exportPath}?${searchParams.toString()}`
        : exportPath

    download(pathWithSearchParams)
    ExportStatistiquesModal.close()
    createToast({
      priority: 'success',
      message,
    })
  }

  const onExportAccompagnementsXlsx = () =>
    exportXlsx(
      publicExportId
        ? `/coop/mes-activites/export/${publicExportId}`
        : '/coop/mes-activites/export',
      `Le téléchargement de vos ${accompagnementsCount} accompagnements est en cours.`,
    )

  const onExportStatistiquesXlsx = () =>
    exportXlsx(
      publicExportId
        ? `/coop/mes-statistiques/export/${publicExportId}`
        : '/coop/mes-statistiques/export',
      'Le téléchargement de vos statistiques est en cours.',
    )

  const onExportStatistiquesPdf = () => {
    ExportStatistiquesModal.close()
    window.print()
    createToast({
      priority: 'success',
      message: 'Le téléchargement de vos statistiques est en cours.',
    })
  }

  const filterLabelsToDisplay = generateActivitesFiltersLabels(filters, {
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
    tagsOptions,
    activiteSourceOptions,
  }).map(toLieuPrefix)

  return (
    <>
      <Button
        {...ExportStatistiquesModal.buttonProps}
        title={title}
        priority="secondary"
        iconId="fr-icon-download-line"
        iconPosition="right"
      >
        Exporter
      </Button>
      <ExportStatistiquesModal.Component title={title}>
        {filterLabelsToDisplay.length > 0 ? (
          <div className="fr-my-6v">
            <p className="fr-mb-2v">
              Vous avez appliqué les filtres suivants&nbsp;:
            </p>
            <ul className="fr-tags-group">
              {filterLabelsToDisplay.map((filter) => (
                <li
                  className="fr-line-height-1"
                  key={`${filter.type}-${filter.key}`}
                >
                  <Tag small>{filter.label}</Tag>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="fr-my-6v">{emptyFilterMessage}</p>
        )}
        {exportListAccompagnements && (
          <>
            <p className="fr-text-label--blue-france fr-text--sm">
              <strong>{accompagnementsCount}</strong> accompagnements prêt à
              être exportés
            </p>
            <div className="fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1 fr-mt-4v fr-border-radius--8">
              <div
                className="fr-background-alt--blue-france fr-p-3v fr-border-radius--8 fr-flex"
                aria-hidden="true"
              >
                <div className="fr-icon-table-line ri-lg fr-line-height-1 fr-text-label--blue-france"></div>
              </div>
              <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--medium fr-mb-0 fr-flex-grow-1">
                Liste des accompagnements
              </div>
              <Button
                title="Telécharger liste des accompagnements au format xlsx"
                priority="tertiary no outline"
                iconId="fr-icon-download-line"
                iconPosition="right"
                onClick={onExportAccompagnementsXlsx}
              >
                Tableur (xlsx)
              </Button>
            </div>
          </>
        )}
        {exportStatistiques && (
          <div className="fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1 fr-mt-4v fr-border-radius--8">
            <div
              className="fr-background-alt--blue-france fr-p-3v fr-border-radius--8 fr-flex"
              aria-hidden="true"
            >
              <div className="fr-icon-chat-poll-fill ri-lg fr-line-height-1 fr-text-label--blue-france"></div>
            </div>
            <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--medium fr-mb-0 fr-flex-grow-1">
              Statistiques
            </div>
            <Button
              title="Telécharger les statistiques d’accompagnement au format PDF"
              priority="tertiary no outline"
              iconId="fr-icon-download-line"
              iconPosition="right"
              onClick={onExportStatistiquesPdf}
            >
              PDF
            </Button>
            <Button
              title="Telécharger les statistiques d’accompagnement au format xlsx"
              priority="tertiary no outline"
              iconId="fr-icon-download-line"
              iconPosition="right"
              onClick={onExportStatistiquesXlsx}
            >
              Tableur (xlsx)
            </Button>
          </div>
        )}
      </ExportStatistiquesModal.Component>
    </>
  )
}
