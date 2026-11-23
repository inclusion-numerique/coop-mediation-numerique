'use client'

import Button from '@codegouvfr/react-dsfr/Button'
import { type ReactNode, useEffect, useRef } from 'react'

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

  useEffect(() => {
    const fermerSiExterieur = (event: MouseEvent) => {
      const cible = event.target
      if (!(cible instanceof Node)) return
      if (boutonRef.current?.contains(cible)) return
      if (menuRef.current?.contains(cible)) return
      if (boutonRef.current?.getAttribute('aria-expanded') === 'true')
        boutonRef.current.click()
    }

    document.addEventListener('mousedown', fermerSiExterieur)
    return () => document.removeEventListener('mousedown', fermerSiExterieur)
  }, [])

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
