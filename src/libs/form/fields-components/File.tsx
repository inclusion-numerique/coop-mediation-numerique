import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  Upload as DsfrUpload,
  type UploadProps as DsfrUploadProps,
} from '@codegouvfr/react-dsfr/Upload'
import { ChangeEvent } from 'react'

type FileProps = Omit<DsfrUploadProps, 'state' | 'stateRelatedMessage'> & {
  isPending: boolean
  accept?: string
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

  return (
    <DsfrUpload
      state={hasErrors ? 'error' : 'default'}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      disabled={isPending || disabled}
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
