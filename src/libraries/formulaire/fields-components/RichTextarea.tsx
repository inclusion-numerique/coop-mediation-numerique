'use client'

import { useFieldContext } from '@/libraries/formulaire/form-context'
import {
  RichTextarea as RichTextareaBase,
  RichTextareaProps as RichTextareaBaseProps,
} from '@/libraries/ui/primitives'

type RichTextareaProps = Omit<RichTextareaBaseProps, 'id' | 'name'> & {
  isPending: boolean
}

export const RichTextarea = (props: RichTextareaProps) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string>()

  return (
    <RichTextareaBase
      id={name}
      name={name}
      value={state.value}
      onBlur={handleBlur}
      onChange={(content: string) => handleChange(content)}
      {...props}
    />
  )
}
