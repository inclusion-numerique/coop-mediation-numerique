'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { download } from '@/libraries/navigateur'
import { createToast } from '@/libraries/ui/toast'
import { lienDExport } from '../search-params/requete-de-l-export.search-params'

const ExportModal = createModal({
  id: 'export-utilisateurs',
  isOpenedByDefault: false,
})

export const BoutonExporterLesUtilisateurs = ({
  requete,
  libelles,
  nombre,
  recherche,
}: {
  requete: string
  libelles: readonly string[]
  nombre: number
  recherche: string | null
}) => {
  const exporter = () => {
    download(lienDExport(requete))
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
              {libelles.map((libelle) => (
                <li className="fr-line-height-1" key={libelle}>
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
