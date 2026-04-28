'use client'

import { handleSubmit } from '@app/web/libs/form/handle-submit'
import Button from '@codegouvfr/react-dsfr/Button'
import ButtonsGroup from '@codegouvfr/react-dsfr/ButtonsGroup'
import type { AnyFormApi } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { useState } from 'react'
import Card from './Card'

const EditCardTanStack = ({
  id,
  className,
  noBorder,
  contentSeparator = true,
  title,
  titleAs: CardTitle = 'h3',
  description,
  edition,
  view,
  emptyState,
  canEdit = true,
  isEmpty = false,
  form,
  isPending,
  noRefresh,
}: {
  id?: string
  className?: string
  noBorder?: boolean
  contentSeparator?: boolean
  title: ReactNode
  titleAs?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  description?: string
  edition: ReactNode
  view: ReactNode
  canEdit?: boolean
  isEmpty?: boolean
  emptyState?: ReactNode
  form: AnyFormApi
  isPending: boolean
  noRefresh?: boolean
}) => {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)

  return (
    <Card
      noBorder={noBorder}
      contentSeparator={contentSeparator}
      id={id}
      className={className}
      title={<CardTitle className="fr-h6 fr-mb-0">{title}</CardTitle>}
      action={
        !editMode &&
        canEdit && (
          <Button
            data-testid="edit-card-button"
            size="small"
            priority="tertiary no outline"
            iconId="fr-icon-edit-line"
            iconPosition="right"
            title={isEmpty ? 'Compléter' : 'Modifier'}
            onClick={() => setEditMode(true)}
          >
            {isEmpty ? 'Compléter' : 'Modifier'}
          </Button>
        )
      }
      description={description}
      titleAs="div"
    >
      {editMode && (
        <form
          onSubmit={async (e) => {
            await handleSubmit(form)(e)
            if (form.state.isValid) {
              setEditMode(false)
              if (!noRefresh) {
                router.refresh()
              }
            }
          }}
        >
          {edition}
          <ButtonsGroup
            inlineLayoutWhen="always"
            alignment="right"
            buttons={[
              {
                children: 'Annuler',
                priority: 'secondary',
                onClick: () => {
                  form.reset()
                  setEditMode(false)
                },
                disabled: isPending,
              },
              {
                children: 'Enregistrer',
                type: 'submit',
                disabled: isPending,
                nativeButtonProps: {
                  'data-testid': 'edit-card-save-button',
                },
              },
            ]}
          />
        </form>
      )}
      {!editMode && (isEmpty ? emptyState : view)}
    </Card>
  )
}

export default EditCardTanStack
