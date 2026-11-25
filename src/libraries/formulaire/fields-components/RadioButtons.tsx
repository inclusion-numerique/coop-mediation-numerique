import {
  RadioButtons as DsfrRadioButtons,
  RadioButtonsProps as DsfrRadioButtonsProps,
} from '@codegouvfr/react-dsfr/RadioButtons'
import classNames from 'classnames'
import {
  ChangeEvent,
  createElement,
  DetailedHTMLProps,
  isValidElement,
  LabelHTMLAttributes,
  ReactNode,
} from 'react'
import { useFieldContext } from '@/libraries/formulaire/form-context'
import { Pictogram } from '@/libraries/pictograms'
import { Stars } from '@/libraries/ui/components'

type RadioButtonsProps = Omit<DsfrRadioButtonsProps, 'name' | 'options'> & {
  isPending: boolean
  isTiled?: boolean | undefined
  options: {
    label: ReactNode
    value: string
    extra?:
      | {
          illustration?: string | Pictogram | ReactNode | undefined
          disabled?: boolean | undefined
          hintText?: ReactNode | undefined
          stars?: number | undefined
          maxStars?: number | undefined
        }
      | undefined
    nativeInputProps?:
      | DetailedHTMLProps<
          LabelHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >
      | undefined
  }[]
}

const Illustration = ({
  extra,
}: {
  extra?:
    | {
        illustration?: string | Pictogram | ReactNode | undefined
      }
    | undefined
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
  classes,
  ...props
}: RadioButtonsProps) => {
  const { name, state, handleBlur, handleChange, form } =
    useFieldContext<string>()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched
  const message = hasErrors ? errors[0]?.message : undefined

  return (
    <DsfrRadioButtons
      {...(hasErrors ? { state: 'error' as const } : {})}
      {...(message === undefined ? {} : { stateRelatedMessage: message })}
      className={classNames(isTiled ? 'fr-radio-buttons' : '', className)}
      legend={<span className="fr-label fr-text--medium">{legend}</span>}
      classes={{
        ...classes,
        content: classNames(
          classes?.content,
          props.hintText ? 'fr-mt-1v' : 'fr-mt-0',
        ),
      }}
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
        ...(option.extra?.hintText === undefined
          ? {}
          : { hintText: option.extra.hintText }),
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
