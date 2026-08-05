'use client'

import RichTextFormLinkTooltip from '@app/ui/components/Form/RichText/RichTextFormLinkTooltip'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { ReactNode, useState } from 'react'
import {
  FieldPath,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form'
import styles from './RichTextForm.module.css'
import RichTextFormMenuBar from './RichTextFormMenuBar'

// Voir RichTextarea.tsx : TipTap 3 a intégré `extension-link` à `StarterKit`, l'option se
// règle donc depuis celui-ci pour ne pas enregistrer la marque `link` deux fois.
const editorExtensions = [
  StarterKit.configure({ link: { openOnClick: false } }),
]

const RichTextForm = <T extends FieldValues>({
  label,
  hint,
  form,
  path,
  id,
  ariaDescribedBy,
  placeholder,
  disabled,
  'data-testid': dataTestId,
  onChange,
}: {
  label?: ReactNode
  hint?: ReactNode
  form: UseFormReturn<T>
  path: FieldPath<T>
  id: string
  ariaDescribedBy?: string
  placeholder?: string
  disabled?: boolean
  'data-testid'?: string
  onChange?: (text: PathValue<T, Path<T>>) => void
}) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content: form.getValues(path),
    immediatelyRender: false,
    onUpdate: (event) => {
      if (onChange) {
        onChange(event.editor.getHTML() as PathValue<T, Path<T>>)
      }
    },
  })

  // Custom tooltip hover logic
  const [hoveredLinkElement, setHoveredLinkElement] =
    useState<HTMLAnchorElement | null>(null)

  return (
    <>
      {label && (
        <label className="fr-label fr-mb-1w" htmlFor={id}>
          {label}
          {hint && <span className="fr-mt-1v fr-hint-text">{hint}</span>}
        </label>
      )}
      {editor ? (
        <div className={styles.container}>
          <RichTextFormMenuBar editor={editor} />
          <EditorContent
            editor={editor}
            className={styles.input}
            aria-describedby={ariaDescribedBy}
            disabled={disabled}
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
    </>
  )
}

export default RichTextForm
