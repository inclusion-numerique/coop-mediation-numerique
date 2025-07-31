import {
  Input as DsfrInput,
  InputProps as DsfrInputProps,
} from '@app/ui/components/Primitives/Form/Input'
import { useFieldContext } from '@app/web/libs/form/form-context'
import { ChangeEvent, DetailedHTMLProps, LabelHTMLAttributes } from 'react'

export type InputProps = Omit<DsfrInputProps, 'name'> & {
  isPending: boolean
  isConnected?: boolean
}

export const Input = ({
  isPending,
  isConnected = true,
  label,
  textArea = false,
  nativeTextAreaProps,
  nativeInputProps,
  nativeLabelProps,
  classes,
  ...props
}: InputProps) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<
    string | number
  >()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0

  const nativeConnectedProps = textArea
    ? {
        textArea: true as const,
        nativeTextAreaProps: {
          name,
          value: state.value ?? '',
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLTextAreaElement>) =>
            handleChange(e.target.value),
          ...nativeTextAreaProps,
        },
        nativeLabelProps: nativeLabelProps as
          | DetailedHTMLProps<
              LabelHTMLAttributes<HTMLTextAreaElement>,
              HTMLTextAreaElement
            >
          | undefined,
      }
    : {
        textArea: false as const,
        nativeInputProps: {
          name,
          value: state.value ?? (nativeInputProps?.type === 'number' ? 0 : ''),
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.value == null || e.target.value === '')
              return handleChange('')

            handleChange(
              nativeInputProps?.type === 'number'
                ? +e.target.value
                : e.target.value,
            )
          },
          ...nativeInputProps,
        },
        nativeLabelProps: nativeLabelProps as
          | DetailedHTMLProps<
              LabelHTMLAttributes<HTMLInputElement>,
              HTMLInputElement
            >
          | undefined,
      }

  const nativeDisconnectedProps = textArea
    ? {
        textArea: true as const,
        nativeTextAreaProps,
        nativeLabelProps: nativeLabelProps as
          | DetailedHTMLProps<
              LabelHTMLAttributes<HTMLTextAreaElement>,
              HTMLTextAreaElement
            >
          | undefined,
      }
    : {
        textArea: false as const,
        nativeInputProps,
        nativeLabelProps: nativeLabelProps as
          | DetailedHTMLProps<
              LabelHTMLAttributes<HTMLInputElement>,
              HTMLInputElement
            >
          | undefined,
      }

  return isConnected ? (
    <DsfrInput
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      label={label}
      id={name}
      disabled={isPending ?? props.disabled}
      classes={{
        ...classes,
        label: classes?.label ?? 'fr-text--medium fr-mb-1v',
      }}
      {...nativeConnectedProps}
      {...props}
    />
  ) : (
    <DsfrInput
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      label={label}
      disabled={isPending ?? props.disabled}
      classes={{
        ...classes,
        label: classes?.label ?? 'fr-text--medium fr-mb-1v',
      }}
      {...nativeDisconnectedProps}
      {...props}
    />
  )
}
