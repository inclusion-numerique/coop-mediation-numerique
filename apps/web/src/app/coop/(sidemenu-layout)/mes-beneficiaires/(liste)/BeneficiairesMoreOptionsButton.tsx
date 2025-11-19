'use client'

import { createToast } from '@app/ui/toast/createToast'
import { download } from '@app/web/utils/download'
import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  RefObject,
  useRef,
} from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import styles from './BeneficiairesMoreOptionsButton.module.css'

const BeneficiairesMoreOptionsButton = () => {
  // The click outside default behavior from dsfr js do not work in this case 🤷‍
  // So we have to use client component and hooks to handle the click outside
  const buttonRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const params = new URLSearchParams(searchParams.toString())

  const onClickOrEnterInsideDropdown = (
    event: KeyboardEvent<HTMLDivElement> | ReactMouseEvent<HTMLDivElement>,
  ) => {
    // Close the dropdown if a link has been clicked
    if (event.target instanceof HTMLAnchorElement) {
      buttonRef.current?.click()
    }
  }
  useOnClickOutside(collapseRef as RefObject<HTMLDivElement>, (event) => {
    // Let the event propagate if clicked on the control button
    if (event.target === buttonRef?.current) {
      return
    }

    // Close the dropdown if open on outside click
    if (buttonRef.current?.getAttribute('aria-expanded') !== 'true') {
      return
    }

    buttonRef.current.click()
  })

  const exportXlsx = (exportPath: string, message: string) => {
    download(exportPath)
    createToast({ priority: 'success', message })
  }

  return (
    <div className={styles.container}>
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
        className={classNames('fr-collapse', 'fr-menu', styles.collapse)}
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

export default BeneficiairesMoreOptionsButton
