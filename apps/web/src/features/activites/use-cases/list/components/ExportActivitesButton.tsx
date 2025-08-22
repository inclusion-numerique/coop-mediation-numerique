'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { redirect } from 'next/navigation'
import type { ActivitesFilters } from '../validation/ActivitesFilters'
import type { ActivitesFiltersLabels } from './generateActivitesFiltersLabels'

const ExportActiviteModal = createModal({
  id: 'export-activites',
  isOpenedByDefault: false,
})

const ExportActivitesButton = ({
  filterLabelsToDisplay,
  filters,
  accompagnementsCount,
}: {
  filters: ActivitesFilters
  filterLabelsToDisplay: ActivitesFiltersLabels
  accompagnementsCount: number
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
    ExportActiviteModal.close()
    createToast({
      priority: 'success',
      message,
    })
  }

  const onExportAccompagnementsXlsx = () =>
    exportXlsx(
      '/coop/mes-activites/export',
      `Le téléchargement de vos ${accompagnementsCount} accompagnements est en cours.`,
    )

  const onExportStatistiquesXlsx = () =>
    exportXlsx(
      '/coop/mes-statistiques/export',
      'Le téléchargement de vos statistiques est en cours.',
    )

  const onExportStatistiquesPdf = () => {
    ExportActiviteModal.close()
    redirect('/coop/mes-statistiques?print=true')
  }

  return (
    <>
      <Button
        {...ExportActiviteModal.buttonProps}
        priority="secondary"
        iconId="fr-icon-download-line"
        iconPosition="right"
      >
        Exporter
      </Button>
      <ExportActiviteModal.Component title="Exports de mes accompagnements">
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
          <p className="fr-my-6v">
            Vous n’avez pas appliqué de filtre, tous vos accompagnements seront
            exportés.
          </p>
        )}
        <p className="fr-text-label--blue-france fr-text--sm">
          <strong>{accompagnementsCount}</strong> accompagnements prêt à être
          exportés
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
      </ExportActiviteModal.Component>
    </>
  )
}

export default ExportActivitesButton
