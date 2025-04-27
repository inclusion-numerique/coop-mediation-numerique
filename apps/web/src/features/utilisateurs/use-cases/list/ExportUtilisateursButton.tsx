'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { UtilisateursFiltersLabels } from '../filter/generateUtilisateursFiltersLabels'
import { UtilisateursFilters } from '../filter/utilisateursFilters'

const ExportUtilisateurModal = createModal({
  id: 'export-utilisateurs',
  isOpenedByDefault: false,
})

const ExportUtilisateursButton = ({
  filterLabels,
  filters,
  matchesCount,
  recherche,
}: {
  filters: UtilisateursFilters
  filterLabels: UtilisateursFiltersLabels
  matchesCount: number
  recherche?: string
}) => {
  const onExport = () => {
    const exportPath = '/administration/utilisateurs/export'
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
    ExportUtilisateurModal.close()
    createToast({
      priority: 'success',
      message: `Le téléchargement de la liste des ${matchesCount} utilisateurs est en cours.`,
    })
  }

  return (
    <>
      <Button
        {...ExportUtilisateurModal.buttonProps}
        priority="secondary"
        iconId="fr-icon-download-line"
        iconPosition="right"
      >
        Exporter
      </Button>
      <ExportUtilisateurModal.Component
        title={
          <>
            Exporter la liste des{' '}
            <span className="fr-text-title--blue-france">
              {matchesCount} utilisateurs
            </span>
          </>
        }
        buttons={[
          {
            title: 'Annuler',
            priority: 'secondary',
            doClosesModal: true,
            children: 'Annuler',
            type: 'button',
          },
          {
            title: 'Exporter',
            doClosesModal: false,
            children: 'Exporter',
            type: 'button',
            onClick: onExport,
          },
        ]}
      >
        {filterLabels.length > 0 || recherche != null ? (
          <>
            <p className="fr-mb-2v">
              Vous avez appliqué les filtres suivants&nbsp;:
            </p>
            <ul className="fr-tags-group">
              {recherche && (
                <li className="fr-line-height-1">
                  <Tag small>{`Recherche : ${recherche}`}</Tag>
                </li>
              )}
              {filterLabels.map((filter) => (
                <li
                  className="fr-line-height-1"
                  key={`${filter.type}-${filter.key}`}
                >
                  <Tag small>{filter.label}</Tag>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="fr-mb-2v">
            Vous n’avez pas appliqué de filtre, tous les utilisateurs seront
            exportées.
          </p>
        )}
      </ExportUtilisateurModal.Component>
    </>
  )
}

export default ExportUtilisateursButton
