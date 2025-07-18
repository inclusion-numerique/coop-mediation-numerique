import {
  RichTextarea as RichTextareaBase,
  RichTextareaProps as RichTextareaBaseProps,
} from '@app/ui/components/Primitives/Form/RichTextarea'
import { useFieldContext } from '@app/web/libs/form/form-context'

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
