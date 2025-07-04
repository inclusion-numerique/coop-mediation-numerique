'use client'

import styles from '@app/ui/components/Form/RichText/RichTextForm.module.css'
import RichTextFormLinkTooltip from '@app/ui/components/Form/RichText/RichTextFormLinkTooltip'
import RichTextFormMenuBar from '@app/ui/components/Form/RichText/RichTextFormMenuBar'
import { Link } from '@tiptap/extension-link'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import React, { ReactNode, useState } from 'react'

const CustomLink = Link.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      openOnClick: false,
    }
  },
})

export type RichTextareaProps = {
  id: string
  name: string
  label?: ReactNode
  placeholder?: string
  hint?: ReactNode
  value?: string
  ariaDescribedBy?: string
  'data-testid'?: string
  disabled?: boolean
  className?: string
  onChange?: (text: string) => void
  onBlur?: (text: string) => void
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
    extensions: [StarterKit, CustomLink],
    content: value,
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
        <div className={styles.container}>
          <RichTextFormMenuBar editor={editor} />
          <EditorContent
            editor={editor}
            className={styles.input}
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
