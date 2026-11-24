'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Image from 'next/image'
import { download } from '@/libraries/navigateur/download'
import { numberToString } from '@/libraries/nombre/format-number'
import { createToast } from '@/libraries/ui/toast/create-toast'

const ExportActiviteModal = createModal({
  id: 'export-activites',
  isOpenedByDefault: false,
})

export const BoutonExporter = ({
  libelles,
  requete,
  activitesCount,
}: {
  libelles: readonly string[]
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
        {libelles.length > 0 ? (
          <div className="fr-my-6v">
            <p className="fr-mb-2v">
              Vous avez appliqué les filtres suivants&nbsp;:
            </p>
            <ul className="fr-tags-group">
              {libelles.map((libelle) => (
                <li className="fr-line-height-1" key={libelle}>
                  <Tag small>{libelle}</Tag>
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
            title="Télécharger vos activités de coordination au format xlsx"
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
