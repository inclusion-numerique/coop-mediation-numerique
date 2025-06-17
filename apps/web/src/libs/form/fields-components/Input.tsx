import { useFieldContext } from '@app/web/libs/form/form-context'
import { Input as DsfrInput } from '@codegouvfr/react-dsfr/Input'
import { InputProps as DsfrInputProps } from '@codegouvfr/react-dsfr/src/Input'
import {
  ChangeEvent,
  DetailedHTMLProps,
  Dispatch,
  LabelHTMLAttributes,
  SetStateAction,
} from 'react'
import { Label } from './Label'

type InputProps = Omit<DsfrInputProps, 'name'> & {
  isPending: boolean
  value?: string
  setValue?: Dispatch<SetStateAction<string>>
  isConnected?: boolean
}

export const Input = ({
  isPending,
  isConnected = true,
  value,
  setValue,
  label,
  textArea = false,
  nativeTextAreaProps,
  nativeInputProps,
  nativeLabelProps,

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
        nativeInputProps: {
          ...nativeInputProps,
          value:
            (nativeInputProps?.value ?? '') === ''
              ? value
              : nativeInputProps?.value,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            setValue?.(e.target.value)
            nativeInputProps?.onChange?.(e)
          },
        },
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
      label={<Label hasErrors={hasErrors}>{label}</Label>}
      id={name}
      disabled={isPending ?? props.disabled}
      classes={{ nativeInputOrTextArea: 'fr-input--white fr-input--14v' }}
      {...nativeConnectedProps}
      {...props}
    />
  ) : (
    <DsfrInput
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      label={<Label hasErrors={hasErrors}>{label}</Label>}
      disabled={isPending ?? props.disabled}
      classes={{ nativeInputOrTextArea: 'fr-input--white fr-input--14v' }}
      {...nativeDisconnectedProps}
      {...props}
    />
  )
}
