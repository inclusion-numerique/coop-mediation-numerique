'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import { numberToString } from '@app/web/utils/formatNumber'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Image from 'next/image'
import type { FiltreActif } from '../../../ui/filtres-actifs-des-coordinations'

const ExportActiviteModal = createModal({
  id: 'export-activites',
  isOpenedByDefault: false,
})

export const BoutonExporter = ({
  filters,
  requete,
  activitesCount,
}: {
  filters: readonly FiltreActif[]
  requete: string
  activitesCount: number
}) => {
  const onExportActivitesXlsx = () => {
    const exportPath = '/coop/mes-coordinations/export'

    download(requete.length > 0 ? `${exportPath}?${requete}` : exportPath)
    ExportActiviteModal.close()
    createToast({
      priority: 'success',
      message: `Le téléchargement de vos ${numberToString(activitesCount)} activités est en cours.`,
    })
  }

  return (
    <>
      <Button
        {...ExportActiviteModal.buttonProps}
        disabled={activitesCount === 0}
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
          <strong>{activitesCount}</strong> activités prêtes à être exportées
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
