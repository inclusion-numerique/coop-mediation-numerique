import Stars from '@app/web/components/Stars'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  RadioButtons as DsfrRadioButtons,
  RadioButtonsProps as DsfrRadioButtonsProps,
} from '@codegouvfr/react-dsfr/RadioButtons'
import classNames from 'classnames'
import { ChangeEvent, DetailedHTMLProps, LabelHTMLAttributes } from 'react'

type RadioButtonsProps = Omit<DsfrRadioButtonsProps, 'name' | 'options'> & {
  isPending: boolean
  options: {
    label: string
    value: string
    extra?: {
      illustration?: string | Pictogram
      disabled?: boolean
      hintText?: string
      stars?: number
      maxStars?: number
    }
    nativeInputProps?: DetailedHTMLProps<
      LabelHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  }[]
}

const Illustration = ({
  extra,
}: {
  extra?: {
    illustration?: string | Pictogram
  }
}) => {
  if (extra?.illustration == null) return null
  return typeof extra.illustration === 'string' ? (
    <img width={56} src={extra.illustration} alt="" className="fr-ml-2v" />
  ) : (
    <extra.illustration width={56} height={56} aria-hidden />
  )
}

export const RadioButtons = ({
  isPending,
  legend,
  options,
  className,
  ...props
}: RadioButtonsProps) => {
  const { name, state, handleBlur, handleChange, form } =
    useFieldContext<string>()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched

  return (
    <DsfrRadioButtons
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      className={classNames('fr-radio-buttons', className)}
      legend={
        <span className="fr-label fr-text--medium fr-mb-2v">{legend}</span>
      }
      disabled={isPending}
      name={name}
      options={options.map((option) => ({
        label:
          typeof option.extra?.stars === 'number' ? (
            <>
              <Stars
                count={option.extra.stars}
                max={option.extra.maxStars}
                className="fr-mb-1v"
              />
              {option.label}
            </>
          ) : (
            <span className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-width-full fr-height-full">
              {option.label}
            </span>
          ),
        value: option.value,
        ...(option.extra?.illustration != null
          ? { illustration: <Illustration extra={option.extra} /> }
          : {}),
        hintText: option.extra?.hintText,
        nativeInputProps: {
          value: option.value,
          checked: option.value === state.value,
          disabled: option.extra?.disabled,
          onBlur: handleBlur,
          onClick: (e) => {
            if ((e.target as HTMLInputElement).value !== state.value) return
            form.resetField(name)
          },
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(e.target.value),
          ...option.nativeInputProps,
        },
      }))}
      {...props}
    />
  )
}
