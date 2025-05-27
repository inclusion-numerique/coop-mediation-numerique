'use client'

import { SessionUser } from '@app/web/auth/sessionUser'
import {
  isConseillerNumerique,
  isCoordinateurConseillerNumerique,
} from '@app/web/auth/userTypeGuards'
import TerminerUsurpationHeaderUserMenuItem from '@app/web/components/TerminerUsurpationHeaderUserMenuItem'
import { isLimitedToInscription } from '@app/web/features/utilisateurs/use-cases/list/getUserLifecycle'
import { getUserDisplayName } from '@app/web/utils/user'
import classNames from 'classnames'
import Link from 'next/link'
import {
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  RefObject,
  useRef,
} from 'react'
import { useOnClickOutside } from 'usehooks-ts'
import styles from './HeaderUserMenu.module.css'

const toMediateurId = ({ mediateurId }: { mediateurId: string }) => mediateurId

const onlyTeamsWith =
  (user: SessionUser) =>
  (coordination: {
    coordinateur: { mediateursCoordonnes: { mediateurId: string }[] }
  }) =>
    user.mediateur?.id != null &&
    coordination.coordinateur.mediateursCoordonnes
      .map(toMediateurId)
      .includes(user.mediateur.id)

export const HeaderUserMenu = ({ user }: { user: SessionUser }) => {
  // The click outside default behavior from dsfr js do not work in this case 🤷‍
  // So we have to use client component and hooks to handle the click outside
  const buttonRef = useRef<HTMLButtonElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)
  const displayName = getUserDisplayName(user)
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
  const structureEmployeuse = user.emplois.at(0)

  const restricted = isLimitedToInscription(user)

  const mediateurCoordinations = user.mediateur?.coordinations.filter(
    onlyTeamsWith(user),
  )

  const menuContent = (
    <ul className="fr-menu__list">
      <li>
        <span className="fr-nav__link fr-display-block fr-pt-4v fr-pb-2v">
          {!!user.name && (
            <span className="fr-text--medium fr-text--sm fr-display-block">
              {user.name}
            </span>
          )}
          <span className="fr-text--sm fr-text-default--grey">
            {user.email}
          </span>
        </span>
      </li>
      {!restricted && (
        <li>
          <Link
            className="fr-nav__link fr-display-block"
            href="/coop/mon-profil"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="ri-account-circle-line fr-mr-1w"
              style={{ color: 'var(--blue-france-sun-113-625)' }}
              aria-hidden
            />
            Voir mon profil
          </Link>
        </li>
      )}
      {!restricted && user.mediateur && (
        <li>
          <Link
            className="fr-nav__link fr-display-block"
            href="/coop/lieux-activite"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="ri-home-office-line fr-mr-1w"
              style={{ color: 'var(--blue-france-sun-113-625)' }}
              aria-hidden
            />
            Voir mes lieux d’activités ·{' '}
            <span className="fr-text--bold">
              {user.mediateur?._count.enActivite}
            </span>
          </Link>
        </li>
      )}
      {!restricted && user.coordinateur && (
        <li>
          <Link
            className="fr-nav__link fr-display-block fr-border--bottom-0"
            href="/coop/mon-equipe"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="ri-group-2-line fr-mr-1w"
              style={{ color: 'var(--blue-france-sun-113-625)' }}
              aria-hidden
            />
            Voir mon équipe ·{' '}
            <span className="fr-text--bold">
              {user.coordinateur.mediateursCoordonnes.length}
            </span>
          </Link>
        </li>
      )}
      {!restricted &&
        !user.coordinateur &&
        mediateurCoordinations?.length === 1 && (
          <li>
            <Link
              className="fr-nav__link fr-display-block fr-border--bottom-0"
              href={`/coop/mes-equipes/${mediateurCoordinations.at(0)?.coordinateur.id}`}
              style={{ boxShadow: 'none' }}
            >
              <span
                className="ri-group-2-line fr-mr-1w"
                style={{ color: 'var(--blue-france-sun-113-625)' }}
                aria-hidden
              />
              Voir mon équipe ·{' '}
              <span className="fr-text--bold">
                {
                  mediateurCoordinations.at(0)?.coordinateur
                    .mediateursCoordonnes.length
                }
              </span>
            </Link>
          </li>
        )}
      {!restricted && (user.mediateur || user.coordinateur) && (
        <li>
          <Link
            className="fr-nav__link fr-display-block"
            href="/coop/tags"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="ri-price-tag-3-line fr-mr-2v"
              style={{ color: 'var(--blue-france-sun-113-625)' }}
              aria-hidden
            />
            Voir mes tags
          </Link>
        </li>
      )}
      {!restricted &&
        (isConseillerNumerique(user) ||
          isCoordinateurConseillerNumerique(user)) && (
          <li>
            <Link
              className="fr-nav__link fr-display-block"
              href="/coop/archives-v1"
              style={{ boxShadow: 'none' }}
            >
              <span
                className="fr-icon--sm fr-icon-archive-line fr-mr-1-5v"
                style={{ color: 'var(--blue-france-sun-113-625)' }}
                aria-hidden
              />
              Mes archives&nbsp;-&nbsp;Coop V.1
            </Link>
          </li>
        )}
      {!restricted &&
        !user.coordinateur &&
        (mediateurCoordinations?.length ?? 0) > 1 && (
          <li className="fr-border--top">
            <span className="fr-nav__link fr-display-block fr-pb-0 fr-text-mention--grey fr-text--medium fr-text--sm">
              Mes équipes
            </span>
            {mediateurCoordinations?.map((coordination, index) => (
              <Link
                key={coordination.coordinateur.id}
                className="fr-nav__link fr-display-block"
                href={`/coop/mes-equipes/${coordination.coordinateur.id}`}
                style={{ boxShadow: 'none' }}
              >
                <span className="fr-flex fr-align-items-center">
                  <span
                    className="ri-group-2-line fr-mr-1w"
                    style={{ color: 'var(--blue-france-sun-113-625)' }}
                    aria-hidden
                  />
                  <span className="fr-flex fr-direction-column">
                    <span>
                      Équipe {index + 1} ·{' '}
                      <span className="fr-text--bold">
                        {coordination.coordinateur.mediateursCoordonnes.length}
                      </span>
                    </span>
                    <small className="fr-text-mention--grey">
                      Coordonnée par {coordination.coordinateur.user.name}
                    </small>
                  </span>
                </span>
              </Link>
            ))}
          </li>
        )}
      {!restricted && structureEmployeuse && (
        <li className="fr-border--top">
          <span className="fr-nav__link fr-display-block fr-pb-0 fr-text-mention--grey fr-text--medium fr-text--sm">
            Ma structure employeuse
          </span>
          <Link
            className="fr-nav__link fr-display-block fr-border--bottom"
            href="/coop/ma-structure-employeuse"
            style={{ boxShadow: 'none' }}
          >
            <span
              className="ri-home-smile-2-line fr-mr-1w"
              style={{ color: 'var(--blue-france-sun-113-625)' }}
              aria-hidden
            />
            {structureEmployeuse.structure.nom}
          </Link>
        </li>
      )}
      {user.usurper && <TerminerUsurpationHeaderUserMenuItem />}
      <li>
        <Link className="fr-nav__link fr-display-block" href="/deconnexion">
          <span
            className="fr-icon-logout-box-r-line fr-icon--sm fr-mr-1w"
            style={{ color: 'var(--blue-france-sun-113-625)' }}
            aria-hidden
          />
          Se déconnecter
        </Link>
      </li>
    </ul>
  )

  /**
   * In mobile, the user menu is displayed in the menu modal.
   * In desktop, the user menu is a button + a dropdown.
   */
  return (
    <>
      <button
        className="fr-nav__btn fr-btn fr-hidden fr-unhidden-lg"
        style={{ fontWeight: 500 }}
        type="button"
        aria-expanded="false"
        aria-controls="header-user-menu"
        ref={buttonRef}
      >
        {displayName}
      </button>
      <div
        role="navigation"
        className={classNames('fr-collapse', 'fr-menu', styles.collapse)}
        id="header-user-menu"
        ref={collapseRef}
        onClick={onClickOrEnterInsideDropdown}
        onKeyDown={onClickOrEnterInsideDropdown}
      >
        {menuContent}
      </div>
      <div
        role="navigation"
        className={classNames('fr-hidden-lg', 'fr-px-1w', styles.mobile)}
      >
        {menuContent}
      </div>
    </>
  )
}
