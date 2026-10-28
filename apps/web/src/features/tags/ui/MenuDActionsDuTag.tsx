'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, type RefObject, useRef } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export const MenuDActionsDuTag = ({
  tagId,
  children,
}: {
  tagId: string
  children: ReactNode
}) => {
  const boutonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const fermer = () => {
    if (boutonRef.current?.getAttribute('aria-expanded') === 'true')
      boutonRef.current.click()
  }

  useOnClickOutside(menuRef as RefObject<HTMLDivElement>, (event) => {
    if (event.target === boutonRef.current) return
    fermer()
  })

  return (
    <div className="fr-position-relative">
      <Button
        type="button"
        aria-expanded="false"
        aria-controls={`tag-actions-menu-${tagId}`}
        priority="tertiary no outline"
        size="small"
        title="Actions"
        iconId="fr-icon-more-fill"
        ref={boutonRef}
      />
      <div
        role="menu"
        className="fr-collapse fr-menu"
        id={`tag-actions-menu-${tagId}`}
        ref={menuRef}
      >
        <ul
          className="fr-menu__list"
          style={{ width: '10rem' }}
          onClickCapture={fermer}
        >
          {children}
        </ul>
      </div>
    </div>
  )
}
