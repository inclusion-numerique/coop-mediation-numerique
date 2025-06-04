import { Input as DsfrInput } from '@codegouvfr/react-dsfr/Input'
import { InputProps as DsfrInputProps } from '@codegouvfr/react-dsfr/src/Input'
import { useFieldContext } from '@app/web/libs/form/form-context'
import { ChangeEvent, DetailedHTMLProps, LabelHTMLAttributes } from 'react'
import { Label } from './Label'

type InputProps = Omit<DsfrInputProps, 'name'> & {
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
  ...props
}: InputProps) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string>()

  const nativeConnectedProps = textArea
    ? {
        textArea: true as const,
        nativeTextAreaProps: {
          name,
          value: state.value,
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
          value: state.value,
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(e.target.value),
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
      label={<Label>{label}</Label>}
      id={name}
      disabled={isPending ?? props.disabled}
      classes={{ nativeInputOrTextArea: 'fr-input--white fr-input--14v' }}
      {...nativeConnectedProps}
      {...props}
    />
  ) : (
    <DsfrInput
      label={<Label>{label}</Label>}
      disabled={isPending ?? props.disabled}
      classes={{ nativeInputOrTextArea: 'fr-input--white fr-input--14v' }}
      {...nativeDisconnectedProps}
      {...props}
    />
  )
}
