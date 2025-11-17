'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import classNames from 'classnames'
import Link from 'next/link'
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
