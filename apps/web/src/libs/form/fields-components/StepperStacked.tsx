import { useFieldContext } from '@app/web/libs/form/form-context'
import Button from '@codegouvfr/react-dsfr/Button'
import { Input, type InputProps } from './Input'

export type StepperProps = InputProps & {
  min?: number
  max: number
  step?: number
  addTitle: string
  removeTitle: string
}

export const StepperStacked = ({
  isPending,
  label,
  min = 0,
  max,
  step = 1,
  addTitle,
  removeTitle,
  classes,
  nativeInputProps,
  ...props
}: StepperProps) => {
  const field = useFieldContext<number>()

  return (
    <Input
      size="x-large"
      label={label}
      classes={{
        ...classes,
        nativeInputOrTextArea: `fr-input--plus-minus ${classes?.nativeInputOrTextArea}`,
        label: `fr-position-absolute fr-text--sm fr-mb-0 fr-text--medium fr-index-1 fr-position-absolute--center-y fr-ml-6v ${classes?.label}`,
      }}
      nativeInputProps={{
        ...nativeInputProps,
        type: 'number',
        min,
        max,
        step,
      }}
      addonEnd={
        <span className="fr-flex fr-direction-column">
          <Button
            className="fr-input-control--plus-stacked"
            disabled={field.state.value >= max}
            priority="tertiary"
            iconId="fr-icon-add-line"
            title={addTitle}
            nativeButtonProps={{ type: 'button', tabIndex: -1 }}
            onClick={() => field.setValue(Math.min(field.state.value + 1, max))}
          />
          <Button
            className="fr-input-control--minus-stacked"
            disabled={field.state.value <= min}
            priority="tertiary"
            iconId="fr-icon-subtract-line"
            title={removeTitle}
            nativeButtonProps={{ type: 'button', tabIndex: -1 }}
            onClick={() => field.setValue(Math.max(field.state.value - 1, min))}
          />
        </span>
      }
      isPending={isPending}
      {...props}
    />
  )
}
