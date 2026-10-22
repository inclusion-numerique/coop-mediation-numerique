'use client'

import { createToast } from '@app/ui/toast/createToast'
import type { LibelleDeFiltre } from '@app/web/features/utilisateurs/ui'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'

const ExportModal = createModal({
  id: 'export-utilisateurs',
  isOpenedByDefault: false,
})

const CHEMIN = '/administration/utilisateurs/export'

export const BoutonExporterLesUtilisateurs = ({
  parametres,
  libelles,
  nombre,
  recherche,
}: {
  parametres: Readonly<Record<string, string>>
  libelles: readonly LibelleDeFiltre[]
  nombre: number
  recherche: string | null
}) => {
  const exporter = () => {
    const query = new URLSearchParams({
      ...parametres,
      ...(recherche === null ? {} : { recherche }),
    })

    download(query.size > 0 ? `${CHEMIN}?${query}` : CHEMIN)
    ExportModal.close()
    createToast({
      priority: 'success',
      message: `Le téléchargement de la liste des ${nombre} utilisateurs est en cours.`,
    })
  }

  return (
    <>
      <Button
        {...ExportModal.buttonProps}
        priority="secondary"
        iconId="fr-icon-download-line"
        iconPosition="right"
      >
        Exporter
      </Button>
      <ExportModal.Component
        title={
          <>
            Exporter la liste des{' '}
            <span className="fr-text-title--blue-france">
              {nombre} utilisateurs
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
            onClick: exporter,
          },
        ]}
      >
        {libelles.length > 0 || recherche !== null ? (
          <>
            <p className="fr-mb-2v">
              Vous avez appliqué les filtres suivants&nbsp;:
            </p>
            <ul className="fr-tags-group">
              {recherche !== null && (
                <li className="fr-line-height-1">
                  <Tag small>{`Recherche : ${recherche}`}</Tag>
                </li>
              )}
              {libelles.map(({ type, cle, libelle }) => (
                <li className="fr-line-height-1" key={`${type}-${cle}`}>
                  <Tag small>{libelle}</Tag>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="fr-mb-2v">
            Vous n’avez pas appliqué de filtre, tous les utilisateurs seront
            exportés.
          </p>
        )}
      </ExportModal.Component>
    </>
  )
}
