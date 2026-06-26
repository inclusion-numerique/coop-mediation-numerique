'use client'

import { createToast } from '@app/ui/toast/createToast'
import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import {
  type AnalyseResponse,
  getBeneficiaireImportAnalysis,
} from '@app/web/features/beneficiaire/abilities/importer-beneficiaires/ui/import-analysis-storage'
import type { ServerActionResult } from '@app/web/libraries/nextjs'
import { pluriel } from '@app/web/libraries/pluriel'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'
import React, {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

// L'action d'import est injectée par la route (concern croisé), l'UI reste
// découplée de l'ability.
export type ImporterBeneficiaires = (
  analysis: AnalyseResponse['analysis'],
) => Promise<ServerActionResult<{ importes: number }>>

const analysisTableHeaders = [
  'Statut',
  'Nom',
  'Prénom',
  'Année de naissance',
  'Commune de résidence',
  'E-mail',
  'Genre',
  'Notes supplémentaires',
]

const communeHeaderIndex = 4

const AnalysisTableCell = ({
  error,
  children,
  id,
}: PropsWithChildren<{ error?: string | null; id: string }>) => (
  <td
    className={classNames(!!error && 'fr-beneficiaire-import-cell-error')}
    aria-describedby={error ? `tooltip-cell-error-${id}` : undefined}
  >
    {children}
    {!!error && (
      <span
        className="fr-tooltip fr-placement"
        id={`tooltip-cell-error-${id}`}
        role="tooltip"
        aria-hidden
      >
        {error}
      </span>
    )}
  </td>
)

const ImportBeneficiairesAnalyseContent = ({
  analysisId,
  importer,
}: {
  analysisId: string
  importer: ImporterBeneficiaires
}) => {
  const analysisResponse = useMemo(
    () => getBeneficiaireImportAnalysis(analysisId),
    [analysisId],
  )

  const router = useRouter()

  useEffect(() => {
    if (!analysisResponse) {
      router.push(`/coop/mes-beneficiaires/importer/erreur`)
      return
    }

    if (analysisResponse.analysis.rows.length === 0) {
      router.push(
        `/coop/mes-beneficiaires/importer/erreur?message=Aucun bénéficiaire détecté`,
      )
    }
  }, [analysisResponse, router.push])

  const tableContainerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!tableContainerRef.current) return

    // If style.marginRight is already set, do nothing
    if (tableContainerRef.current.style.marginRight) return

    // This is in a 792px container, centered.
    const emptySpace = window.innerWidth - 792

    // Calculate the distance from the right edge of the container to the right edge of the window
    const distanceToWindowRight = emptySpace / 2

    // Apply a negative margin-right to extend the container to the right edge of the window
    tableContainerRef.current.style.marginRight = `-${distanceToWindowRight}px`
  }, [])

  const [pending, setPending] = useState(false)

  if (!analysisResponse || analysisResponse.analysis.rows.length === 0) {
    return null
  }

  const {
    analysis: { rows, status },
  } = analysisResponse

  const onConfirm = async () => {
    setPending(true)
    const result = await importer(analysisResponse.analysis)

    if (!result.success) {
      setPending(false)
      createToast({
        priority: 'error',
        message:
          'Une erreur est survenue lors de l’import des bénéficiaires, veuillez réessayer ultérieurement.',
      })
      return
    }

    createToast({
      priority: 'success',
      message: `${result.data.importes} ${pluriel(
        result.data.importes,
        'bénéficiaire importé',
        'bénéficiaires importés',
      )}`,
    })
    router.push(`/coop/mes-beneficiaires`)
  }

  const loading = pending

  const errorsCount = rows.reduce(
    (count, row) => (row.errors ? count + 1 : count),
    0,
  )

  return (
    <>
      <p className="fr-text--lg fr-text--bold fr-mb-6v">
        Nous avons détécté{' '}
        <span className="fr-text-title--blue-france">
          {rows.length} {pluriel(rows.length, 'bénéficiaire', 'bénéficiaires')}
        </span>
      </p>
      {status === 'ok' ? (
        <Notice className="fr-notice--success" title="Aucune erreur détectée" />
      ) : (
        <div className="fr-notice fr-notice--error">
          <div className="fr-container">
            <div className="fr-notice__body ">
              <p className="fr-notice__title fr-text--lg fr-text--bold fr-mb-1v ">
                {errorsCount}{' '}
                {pluriel(errorsCount, 'bénéficiaire', 'bénéficiaires')}{' '}
                contiennent des erreurs
              </p>
              <p className="fr-text--sm fr-mb-0 ">
                Nous vous conseillons d’annuler l’import, de les corriger dans
                votre fichier Excel puis de ré-importer le fichier.
              </p>
            </div>
          </div>
        </div>
      )}
      <div
        ref={tableContainerRef}
        className={classNames('fr-beneficiaire-import-table', 'fr-mt-6v')}
      >
        <div className={classNames('fr-table')} data-fr-js-table="true">
          <div className={classNames('fr-table__wrapper')}>
            <div className={classNames('fr-table__container')}>
              <div className={classNames('fr-table__content')}>
                <table data-fr-js-table-element="true">
                  <thead>
                    <tr>
                      {analysisTableHeaders.map((header, index) => (
                        <th
                          scope="col"
                          key={header}
                          colSpan={communeHeaderIndex === index ? 3 : undefined}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          {row.errors ? (
                            <span
                              className="fr-badge fr-badge--error"
                              style={{ width: 28 }}
                            />
                          ) : (
                            <span
                              className="fr-badge fr-badge--success"
                              style={{ width: 28 }}
                            />
                          )}
                        </td>
                        <AnalysisTableCell
                          id={`${index}-nom`}
                          error={row.errors?.nom}
                        >
                          {row.values.nom}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-prenom`}
                          error={row.errors?.prenom}
                        >
                          {row.values.prenom}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-anneeNaissance`}
                          error={row.errors?.anneeNaissance}
                        >
                          {row.values.anneeNaissance}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-communeCodeInsee`}
                          error={row.errors?.communeCodeInsee}
                        >
                          {row.values.communeCodeInsee}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-communeNom`}
                          error={row.errors?.communeNom}
                        >
                          {row.values.communeNom}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-communeCodePostal`}
                          error={row.errors?.communeCodePostal}
                        >
                          {row.values.communeCodePostal}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-email`}
                          error={row.errors?.email}
                        >
                          {row.values.email}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-genre`}
                          error={row.errors?.genre}
                        >
                          {row.values.genre}
                        </AnalysisTableCell>
                        <AnalysisTableCell
                          id={`${index}-notesSupplementaires`}
                          error={row.errors?.notesSupplementaires}
                        >
                          {row.values.notesSupplementaires}
                        </AnalysisTableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="fr-btns-group fr-mt-12v">
        <Button
          type="button"
          priority="primary"
          {...buttonLoadingClassname(loading)}
          onClick={onConfirm}
        >
          Valider l’import
        </Button>
        <Button
          priority="secondary"
          linkProps={{ href: '/coop/mes-beneficiaires/importer' }}
          className={classNames(loading && 'fr-btn--disabled')}
        >
          Retour au choix du fichier
        </Button>
      </div>
    </>
  )
}

export default ImportBeneficiairesAnalyseContent
