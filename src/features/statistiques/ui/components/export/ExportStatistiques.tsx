'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { use } from 'react'
import type { ActivitesFilters } from '@/features/statistiques/domain/filtres-des-activites'
import {
  generateActivitesFiltersLabels,
  toLieuPrefix,
} from '@/features/statistiques/ui/labels/filtres.labels'
import {
  hrefDeLExportDesAccompagnements,
  hrefDeLExportDesStatistiques,
} from '@/features/statistiques/ui/presenters/liens.presenter'
import { MediateurOption } from '@/features/statistiques/ui/presenters/options-de-la-barre.presenter'
import { adresseDesFiltres } from '@/features/statistiques/ui/search-params/filtres-de-la-barre.search-params'
import { download } from '@/libraries/navigateur/download'
import { numberToString } from '@/libraries/nombre/formatNumber'
import type { SelectOption } from '@/libraries/ui/components/Form/utils/options'
import { createToast } from '@/libraries/ui/toast/createToast'
import type { VocabulaireDeLaBarre } from '../../labels/barre.labels'
import type { OptionDeBeneficiaire } from '../../presenters/options-de-la-barre.presenter'
import { useImpressionPrete } from '../impression-prete'

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
  const impressionPrete = useImpressionPrete()
  const exportXlsx = (exportPath: string, message: string) => {
    download(adresseDesFiltres(exportPath, filters))
    ExportStatistiquesModal.close()
    createToast({
      priority: 'success',
      message,
    })
  }

  const onExportAccompagnementsXlsx = () =>
    exportXlsx(
      hrefDeLExportDesAccompagnements(publicExportId),
      `Le téléchargement de vos ${numberToString(nombreDAccompagnements)} accompagnements est en cours.`,
    )

  const onExportStatistiquesXlsx = () =>
    exportXlsx(
      hrefDeLExportDesStatistiques(publicExportId),
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
        disabled={nombreDAccompagnements === 0 || !impressionPrete}
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
                <div className="fr-icon-table-line fr-line-height-1 fr-text-label--blue-france"></div>
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
              <div className="fr-icon-chat-poll-fill fr-line-height-1 fr-text-label--blue-france"></div>
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
