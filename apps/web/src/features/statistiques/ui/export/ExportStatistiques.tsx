'use client'

import type { SelectOption } from '@app/ui/components/Form/utils/options'
import { createToast } from '@app/ui/toast/createToast'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@app/web/features/statistiques/ui/filtres/libelles-des-filtres'
import { MediateurOption } from '@app/web/features/statistiques/ui/filtres/mediateur-option'
import type { ActivitesFilters } from '@app/web/features/statistiques/ui/filtres/parametres-de-la-barre'
import { download } from '@app/web/utils/download'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { use } from 'react'
import type { OptionDeBeneficiaire } from '../filtres/option-de-beneficiaire'
import type { VocabulaireDeLaBarre } from '../filtres/vocabulaire-de-la-barre'

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
  vocabulaire,
  exportListAccompagnements = true,
  exportStatistiques = true,
  publicExportId,
  title = 'Exports des accompagnements',
  emptyFilterMessage = 'Vous n’avez pas appliqué de filtre, tous les accompagnements seront exportés.',
}: {
  filters: ActivitesFilters
  mediateursOptions: MediateurOption[]
  beneficiairesOptions: OptionDeBeneficiaire[]
  lieuxActiviteOptions: SelectOption[]
  departementsOptions: SelectOption[]
  communesOptions: SelectOption[]
  tagsOptions: { id: string; nom: string }[]
  accompagnementsCount: Promise<number>
  activiteSourceOptions: SelectOption[]
  vocabulaire: VocabulaireDeLaBarre
  exportListAccompagnements?: boolean
  exportStatistiques?: boolean
  publicExportId?: string
  title?: string
  emptyFilterMessage?: string
}) => {
  const nombreDAccompagnements = use(accompagnementsCount)
  const exportXlsx = (exportPath: string, message: string) => {
    const searchParams = new URLSearchParams(
      Object.entries(filters).flatMap(([key, value]) =>
        value ? [[key, Array.isArray(value) ? value.join(',') : value]] : [],
      ),
    )

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
      `Le téléchargement de vos ${numberToString(nombreDAccompagnements)} accompagnements est en cours.`,
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
    vocabulaire,
    communesOptions,
    departementsOptions,
    lieuxActiviteOptions,
    beneficiairesOptions,
    mediateursOptions,
    structuresEmployeusesOptions: [],
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
        disabled={nombreDAccompagnements === 0}
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
              <strong>{nombreDAccompagnements}</strong> accompagnements prêt à
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
                title="Télécharger liste des accompagnements au format xlsx"
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
              title="Télécharger les statistiques d’accompagnement au format PDF"
              priority="tertiary no outline"
              iconId="fr-icon-download-line"
              iconPosition="right"
              onClick={onExportStatistiquesPdf}
            >
              PDF
            </Button>
            <Button
              title="Télécharger les statistiques d’accompagnement au format xlsx"
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

export const ExportStatistiquesEnAttente = ({
  title = 'Exports des accompagnements',
}: {
  title?: string
}) => (
  <Button
    title={title}
    priority="secondary"
    iconId="fr-icon-download-line"
    iconPosition="right"
    disabled
  >
    Exporter
  </Button>
)
