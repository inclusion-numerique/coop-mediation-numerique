import { useFieldContext } from '@app/web/libs/form/form-context'
import Button from '@codegouvfr/react-dsfr/Button'
import { Input, type InputProps } from './Input'

export type StepperProps = InputProps & {
  min?: number
  max?: number
  step?: number
  size?: 'small' | 'medium' | 'large'
  addTitle: string
  removeTitle: string
}

export const Stepper = ({
  isPending,
  label,
  min = 0,
  max,
  step = 1,
  size = 'medium',
  addTitle,
  removeTitle,
  classes,
  ...props
}: StepperProps) => {
  const field = useFieldContext<number>()

  return (
    <Input
      size={size}
      classes={{
        ...classes,
        nativeInputOrTextArea: `fr-input--plus-minus ${classes?.nativeInputOrTextArea}`,
      }}
      label={label}
      nativeInputProps={{
        ...props.nativeInputProps,
        type: 'number',
        min,
        step,
        max,
      }}
      addonStart={
        <Button
          disabled={field.state.value === min}
          size={size}
          priority="tertiary"
          iconId="fr-icon-subtract-line"
          title={removeTitle}
          nativeButtonProps={{ type: 'button', tabIndex: -1 }}
          onClick={() =>
            field.setValue(Math.max((field.state.value ?? 0) - 1, min))
          }
        />
      }
      addonEnd={
        <Button
          disabled={max != null ? field.state.value === max : undefined}
          size={size}
          priority="tertiary"
          iconId="fr-icon-add-line"
          title={addTitle}
          nativeButtonProps={{ type: 'button', tabIndex: -1 }}
          onClick={() =>
            max != null
              ? field.setValue(Math.min(field.state.value + 1, max))
              : field.setValue((field.state.value ?? 0) + 1)
          }
        />
      }
      isPending={isPending}
      {...props}
    />
  )
}
