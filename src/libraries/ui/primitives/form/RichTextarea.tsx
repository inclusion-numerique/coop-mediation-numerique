'use client'

import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ReactNode, useState } from 'react'
import {
  RichTextFormLinkTooltip,
  RichTextFormMenuBar,
} from '@/libraries/ui/form'

// TipTap 3 a intégré `extension-link` à `StarterKit`. Déclarer les deux enregistrerait la
// marque `link` en double, ce que TipTap rejette au démarrage de l'éditeur — l'option se
// règle donc désormais depuis `StarterKit`.
const editorExtensions = [
  StarterKit.configure({ link: { openOnClick: false } }),
]

export type RichTextareaProps = {
  id: string
  name: string
  label?: ReactNode | undefined
  placeholder?: string | undefined
  hint?: ReactNode | undefined
  value?: string | undefined
  ariaDescribedBy?: string | undefined
  'data-testid'?: string | undefined
  disabled?: boolean | undefined
  className?: string | undefined
  onChange?: ((text: string) => void) | undefined
  onBlur?: ((text: string) => void) | undefined
}

export const RichTextarea = ({
  id,
  name,
  label,
  placeholder,
  hint,
  value,
  disabled,
  ariaDescribedBy,
  'data-testid': dataTestId,
  className,
  onChange,
  onBlur,
}: RichTextareaProps) => {
  const editor = useEditor({
    extensions: editorExtensions,
    ...(value === undefined ? {} : { content: value }),
    immediatelyRender: false,
    onUpdate: (event) => {
      if (onChange) {
        onChange(event.editor.getHTML())
      }
    },
    onBlur: (event) => {
      if (onBlur) {
        onBlur(event.editor.getHTML())
      }
    },
  })

  const [hoveredLinkElement, setHoveredLinkElement] =
    useState<HTMLAnchorElement | null>(null)

  return (
    <div className={className}>
      {label && (
        <label
          className="fr-label fr-mb-1v fr-text--medium fr-mb-3v"
          htmlFor={id}
        >
          {label}
          {hint && <span className="fr-mt-1v fr-hint-text">{hint}</span>}
        </label>
      )}
      {editor ? (
        <div className="fr-position-relative">
          <RichTextFormMenuBar editor={editor} />
          <EditorContent
            editor={editor}
            className="texte-riche__saisie"
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
            name={name}
            id={id}
            onMouseOver={(event) => {
              if (event.target instanceof HTMLAnchorElement) {
                setHoveredLinkElement(event.target)
              }
            }}
            onMouseOut={(event) => {
              if (event.target instanceof HTMLAnchorElement) {
                setHoveredLinkElement(null)
              }
            }}
            placeholder={placeholder}
            data-testid={dataTestId}
          />
          <RichTextFormLinkTooltip element={hoveredLinkElement} />
        </div>
      ) : null}
    </div>
  )
}
