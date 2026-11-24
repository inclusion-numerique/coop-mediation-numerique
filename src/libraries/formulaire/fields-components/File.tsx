import {
  Upload as DsfrUpload,
  type UploadProps as DsfrUploadProps,
} from '@codegouvfr/react-dsfr/Upload'
import { ChangeEvent } from 'react'
import { useFieldContext } from '@/libraries/formulaire/form-context'

type FileProps = Omit<DsfrUploadProps, 'state' | 'stateRelatedMessage'> & {
  isPending: boolean
  accept?: string | undefined
}

export const File = ({
  isPending,
  accept,
  disabled,
  nativeInputProps,
  ...props
}: FileProps) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<
    globalThis.File | undefined
  >()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0
  const message = hasErrors ? errors[0]?.message : undefined

  return (
    <DsfrUpload
      state={hasErrors ? 'error' : 'default'}
      {...(message === undefined ? {} : { stateRelatedMessage: message })}
      disabled={isPending || (disabled ?? false)}
      {...props}
      nativeInputProps={{
        name,
        accept,
        onBlur: handleBlur,
        onChange: (event: ChangeEvent<HTMLInputElement>) =>
          handleChange(event.target.files?.[0]),
        ...nativeInputProps,
      }}
    />
  )
}
