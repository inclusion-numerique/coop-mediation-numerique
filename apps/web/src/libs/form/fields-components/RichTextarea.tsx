import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  RichTextarea as RichTextareaBase,
  RichTextareaProps as RichTextareaBaseProps,
} from '@app/web/libs/ui/primitives/form/RichTextarea'

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
