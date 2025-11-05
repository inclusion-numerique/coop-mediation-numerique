'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Image from 'next/image'
import React from 'react'

type Filter = {
  params: string[]
  label: string
  value?: string
}

const ExportActiviteModal = createModal({
  id: 'export-activites',
  isOpenedByDefault: false,
})

const ExportActivitesCoordinationButton = ({
  filters,
  searchParams,
  activitesCount: activitesCountPromise,
}: {
  filters: Filter[]
  searchParams: Promise<Record<string, string>>
  activitesCount: Promise<number>
}) => {
  const onExportActivitesXlsx = async () => {
    const activitesCount = await activitesCountPromise
    const exportPath = '/coop/mes-coordinations/export'
    const queryString = new URLSearchParams(await searchParams).toString()

    download(
      queryString.length > 0 ? `${exportPath}?${queryString}` : exportPath,
    )
    ExportActiviteModal.close()
    createToast({
      priority: 'success',
      message: `Le téléchargement de vos ${activitesCount} activités est en cours.`,
    })
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
      <ExportActiviteModal.Component title="Exports de mes activités de coordination">
        {filters.length > 0 ? (
          <div className="fr-my-6v">
            <p className="fr-mb-2v">
              Vous avez appliqué les filtres suivants&nbsp;:
            </p>
            <ul className="fr-tags-group">
              {filters.map((filter) => (
                <li
                  className="fr-line-height-1"
                  key={`${filter.params.join('-')}-${filter.label}`}
                >
                  <Tag small>{filter.label}</Tag>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="fr-my-6v">
            Vous n’avez pas appliqué de filtre, toutes les activités seront
            exportés.
          </p>
        )}
        <p className="fr-text-label--blue-france fr-text--sm">
          <strong>{activitesCountPromise}</strong> activités prêtes à être
          exportées
        </p>
        <div className="fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1 fr-mt-4v fr-border-radius--8">
          <div
            className="fr-background-alt--blue-france fr-p-3v fr-border-radius--8 fr-flex"
            aria-hidden="true"
          >
            <Image
              className="fr-display-block"
              src="/images/services/coordination-logo-small.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>
          <div>
            <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--medium fr-mb-0 fr-flex-grow-1">
              Mes activités de coordination
            </div>
            <span className="fr-text-mention--grey fr-text--xs fr-mb-0">
              Données brutes
            </span>
          </div>
          <Button
            title="Telécharger vos activités de coordination au format xlsx"
            priority="tertiary no outline"
            iconId="fr-icon-download-line"
            iconPosition="right"
            onClick={onExportActivitesXlsx}
          >
            Tableur (xlsx)
          </Button>
        </div>
      </ExportActiviteModal.Component>
    </>
  )
}

export default ExportActivitesCoordinationButton
