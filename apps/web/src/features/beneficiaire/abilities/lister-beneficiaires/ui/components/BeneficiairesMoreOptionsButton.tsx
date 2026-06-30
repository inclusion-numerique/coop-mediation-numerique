'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useRef,
} from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export const BeneficiairesMoreOptionsButton = () => {
  // Le click-outside par défaut du JS DSFR ne fonctionne pas ici, on le gère
  // donc côté client via des refs et un hook.
  const buttonRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const onClickOrEnterInsideDropdown = (
    event: KeyboardEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>,
  ) => {
    // Ferme le menu si un lien a été cliqué.
    if (event.target instanceof HTMLAnchorElement) {
      buttonRef.current?.click()
    }
  }

  useOnClickOutside(collapseRef as RefObject<HTMLDivElement>, (event) => {
    // Laisse l'évènement se propager si on a cliqué sur le bouton de contrôle.
    if (event.target === buttonRef?.current) return

    // Ferme le menu s'il est ouvert lors d'un clic à l'extérieur.
    if (buttonRef.current?.getAttribute('aria-expanded') !== 'true') return

    buttonRef.current.click()
  })

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
                  `/coop/mes-beneficiaires/export?${params}`,
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
