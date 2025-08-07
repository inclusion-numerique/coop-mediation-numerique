import Stars from '@app/web/components/Stars'
import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  RadioButtons as DsfrRadioButtons,
  RadioButtonsProps as DsfrRadioButtonsProps,
} from '@codegouvfr/react-dsfr/RadioButtons'
import classNames from 'classnames'
import {
  ChangeEvent,
  DetailedHTMLProps,
  LabelHTMLAttributes,
  ReactNode,
  createElement,
  isValidElement,
} from 'react'

type RadioButtonsProps = Omit<DsfrRadioButtonsProps, 'name' | 'options'> & {
  isPending: boolean
  isTiled?: boolean
  options: {
    label: string
    value: string
    extra?: {
      illustration?: string | Pictogram | ReactNode
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
    illustration?: string | Pictogram | ReactNode
  }
}) => {
  const illustration = extra?.illustration

  if (typeof illustration === 'string') {
    return <img width={56} src={illustration} alt="" className="fr-ml-2v" />
  }

  if (isValidElement(illustration)) {
    return illustration
  }

  if (typeof illustration === 'function') {
    return createElement(illustration, {
      width: 56,
      height: 56,
      'aria-hidden': true,
    })
  }

  return null
}

export const RadioButtons = ({
  isPending,
  isTiled = true,
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
      className={classNames(isTiled ? 'fr-radio-buttons' : '', className)}
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
            option.label
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
