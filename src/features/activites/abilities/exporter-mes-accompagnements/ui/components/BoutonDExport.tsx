'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { createModal } from '@codegouvfr/react-dsfr/Modal'
import Tag from '@codegouvfr/react-dsfr/Tag'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { download } from '@/libraries/navigateur/download'
import { numberToString } from '@/libraries/nombre/format-number'
import { pluriel } from '@/libraries/pluriel'
import { createToast } from '@/libraries/ui/toast/create-toast'
import { cheminDImpressionDesStatistiques } from '../presenters/export.presenter'
import { cheminAvecRequete } from '../search-params/requete-de-l-export.search-params'

const ModaleDExport = createModal({
  id: 'export-des-accompagnements',
  isOpenedByDefault: false,
})

const FormatDExport = ({
  icone,
  titre,
  children,
}: {
  icone: string
  titre: string
  children: ReactNode
}) => (
  <div className="fr-border fr-py-4v fr-px-6v fr-flex fr-align-items-center fr-flex-gap-4v fr-flex-grow-1 fr-mt-4v fr-border-radius--8">
    <div
      className="fr-background-alt--blue-france fr-p-3v fr-border-radius--8 fr-flex"
      aria-hidden="true"
    >
      <div className={`${icone} fr-line-height-1 fr-text-label--blue-france`} />
    </div>
    <div className="fr-flex fr-align-items-center fr-justify-content-start fr-text--medium fr-mb-0 fr-flex-grow-1">
      {titre}
    </div>
    {children}
  </div>
)

export const BoutonDExport = ({
  libelles,
  requete,
  nombreDAccompagnements,
}: {
  libelles: readonly string[]
  requete: string
  nombreDAccompagnements: number
}) => {
  const router = useRouter()

  const telecharger = (chemin: string, message: string) => {
    download(cheminAvecRequete(chemin, requete))
    ModaleDExport.close()
    createToast({ priority: 'success', message })
  }

  const exporterLesAccompagnements = () =>
    telecharger(
      '/coop/mes-activites/export',
      pluriel(
        nombreDAccompagnements,
        'Le téléchargement de votre accompagnement est en cours.',
        `Le téléchargement de vos ${numberToString(nombreDAccompagnements)} accompagnements est en cours.`,
      ),
    )

  const exporterLesStatistiques = () =>
    telecharger(
      '/coop/mes-statistiques/export',
      'Le téléchargement de vos statistiques est en cours.',
    )

  const imprimerLesStatistiques = () => {
    ModaleDExport.close()
    router.push(cheminDImpressionDesStatistiques(requete))
  }

  return (
    <>
      <Button
        {...ModaleDExport.buttonProps}
        priority="secondary"
        iconId="fr-icon-download-line"
        iconPosition="right"
      >
        Exporter
      </Button>
      <ModaleDExport.Component title="Exports de mes accompagnements">
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
            Vous n’avez pas appliqué de filtre, tous vos accompagnements seront
            exportés.
          </p>
        )}
        <p className="fr-text-label--blue-france fr-text--sm">
          <strong>{nombreDAccompagnements}</strong>{' '}
          {pluriel(
            nombreDAccompagnements,
            'accompagnement prêt à être exporté',
            'accompagnements prêts à être exportés',
          )}
        </p>
        <FormatDExport
          icone="fr-icon-table-line"
          titre="Liste des accompagnements"
        >
          <Button
            title="Télécharger la liste des accompagnements au format xlsx"
            priority="tertiary no outline"
            iconId="fr-icon-download-line"
            iconPosition="right"
            onClick={exporterLesAccompagnements}
          >
            Tableur (xlsx)
          </Button>
        </FormatDExport>
        <FormatDExport icone="fr-icon-chat-poll-fill" titre="Statistiques">
          <Button
            title="Télécharger les statistiques d’accompagnement au format PDF"
            priority="tertiary no outline"
            iconId="fr-icon-download-line"
            iconPosition="right"
            onClick={imprimerLesStatistiques}
          >
            PDF
          </Button>
          <Button
            title="Télécharger les statistiques d’accompagnement au format xlsx"
            priority="tertiary no outline"
            iconId="fr-icon-download-line"
            iconPosition="right"
            onClick={exporterLesStatistiques}
          >
            Tableur (xlsx)
          </Button>
        </FormatDExport>
      </ModaleDExport.Component>
    </>
  )
}
