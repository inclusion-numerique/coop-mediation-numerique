'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
} from 'react'
import { hrefDeLExportDesBeneficiaires } from '@/features/beneficiaire/ui/presenters/liens.presenter'
import { download } from '@/libraries/navigateur'
import { createToast } from '@/libraries/ui/toast'

export const BeneficiairesMoreOptionsButton = () => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const onClickOrEnterInsideDropdown = (
    event: KeyboardEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>,
  ) => {
    if (event.target instanceof HTMLAnchorElement) {
      buttonRef.current?.click()
    }
  }

  useEffect(() => {
    const fermerAuClicExterieur = (event: Event) => {
      if (!(event.target instanceof Node)) return
      if (collapseRef.current?.contains(event.target)) return
      if (event.target === buttonRef.current) return
      if (buttonRef.current?.getAttribute('aria-expanded') !== 'true') return
      buttonRef.current.click()
    }
    document.addEventListener('mousedown', fermerAuClicExterieur)
    document.addEventListener('touchstart', fermerAuClicExterieur)
    return () => {
      document.removeEventListener('mousedown', fermerAuClicExterieur)
      document.removeEventListener('touchstart', fermerAuClicExterieur)
    }
  }, [])

  const exportXlsx = (exportPath: string, message: string) => {
    download(exportPath)
    createToast({ priority: 'success', message })
  }

  return (
    <div className="fr-menu-anchor">
      <Button
        type="button"
        aria-expanded="false"
        aria-controls="beneficiaires-more-options-menu"
        title="Plus d’options"
        priority="secondary"
        iconId="fr-icon-more-fill"
        ref={buttonRef}
      />
      <div
        role="navigation"
        className={classNames('fr-collapse', 'fr-menu', 'fr-menu--dropdown')}
        id="beneficiaires-more-options-menu"
        ref={collapseRef}
        onClick={onClickOrEnterInsideDropdown}
        onKeyDown={onClickOrEnterInsideDropdown}
      >
        <ul className="fr-menu__list">
          <li>
            <Link
              className="fr-nav__link fr-display-block"
              href="/coop/mes-beneficiaires/importer"
              style={{ boxShadow: 'none' }}
            >
              <span
                className="fr-icon-upload-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                aria-hidden
              />
              Importer des bénéficiaires
            </Link>
          </li>
          <li>
            <Button
              priority="tertiary no outline"
              className="fr-nav__link fr-display-block"
              onClick={() =>
                exportXlsx(
                  hrefDeLExportDesBeneficiaires(params.toString()),
                  'Le téléchargement de vos bénéficiaires est en cours.',
                )
              }
            >
              <span
                className="fr-icon-download-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                aria-hidden
              />
              Exporter mes bénéficiaires
            </Button>
          </li>
          <li>
            <Link
              className="fr-nav__link fr-display-block"
              href="/coop/mes-beneficiaires/doublons"
            >
              <span
                className="fr-icon-group-line fr-icon--sm fr-mr-1w fr-text-label--blue-france"
                aria-hidden
              />
              Gérer les doublons
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
