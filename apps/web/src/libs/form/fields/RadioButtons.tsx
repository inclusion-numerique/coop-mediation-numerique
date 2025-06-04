import {
  RadioButtons as DsfrRadioButtons,
  RadioButtonsProps as DsfrRadioButtonsProps,
} from '@codegouvfr/react-dsfr/RadioButtons'
import { useFieldContext } from '@app/web/libs/form/form-context'
import { ChangeEvent, DetailedHTMLProps, LabelHTMLAttributes } from 'react'

type RadioButtonsProps = Omit<DsfrRadioButtonsProps, 'name' | 'options'> & {
  isPending: boolean
  options: {
    label: string
    value: string
    extra?: { illustration?: string; disabled?: boolean; hintText?: string }
    nativeInputProps?: DetailedHTMLProps<
      LabelHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  }[]
}

export const RadioButtons = ({
  isPending,
  legend,
  options,
  ...props
}: RadioButtonsProps) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string>()

  return (
    <DsfrRadioButtons
      legend={<span className="fr-label fr-text--medium">{legend}</span>}
      disabled={isPending}
      name={name}
      options={options.map((option) => ({
        label: option.label,
        value: option.value,
        ...(option.extra?.illustration != null
          ? { illustration: <img src={option.extra.illustration} alt="" /> }
          : {}),
        hintText: option.extra?.hintText,
        className: 'fr-radio-group--selected',
        nativeInputProps: {
          value: option.value,
          checked: option.value === state.value,
          disabled: option.extra?.disabled,
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(e.target.value),
          ...option.nativeInputProps,
        },
      }))}
      {...props}
    />
  )
}
