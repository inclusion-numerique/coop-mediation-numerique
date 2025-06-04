import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  Checkbox as DsfrCheckbox,
  CheckboxProps as DsfrCheckboxProps,
} from '@codegouvfr/react-dsfr/Checkbox'
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip'
import classNames from 'classnames'
import { ChangeEvent, DetailedHTMLProps, LabelHTMLAttributes } from 'react'

type CheckboxProps<T> = Omit<DsfrCheckboxProps, 'name' | 'options'> & {
  isPending: boolean
  isTiled?: boolean
  options: {
    label: string
    value: T
    hint?: string
    extra?: {
      illustration?: string
      disabled?: boolean
      hintText?: string
      tooltips?: readonly string[]
    }
    nativeInputProps?: DetailedHTMLProps<
      LabelHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  }[]
}

const setValue =
  (e: ChangeEvent<HTMLInputElement>) =>
  <T,>({ value }: { value?: T | T[] }) => {
    if (value === false) return true as T
    if (value == null) return [e.target.value as T]
    if (Array.isArray(value)) return [...(value ?? []), e.target.value as T]
    return value
  }

const removeValue =
  (e: ChangeEvent<HTMLInputElement>) =>
  <T,>({ value }: { value?: T | T[] }) => {
    if (value === true) return false as T
    if (Array.isArray(value))
      return value?.filter((val) => val !== e.target.value)
    return undefined
  }

const isChecked =
  <T,>(option: { value: T }) =>
  ({ value }: { value?: T | T[] }) =>
    Array.isArray(value)
      ? value?.includes(option.value)
      : value === option.value

export const Checkbox = <T,>({
  isPending,
  legend,
  options,
  isTiled = true,
  className,
  ...props
}: CheckboxProps<T>) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<
    T | T[] | undefined
  >()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched

  return (
    <DsfrCheckbox
      state={hasErrors ? 'error' : undefined}
      stateRelatedMessage={hasErrors ? errors[0].message : undefined}
      className={classNames(isTiled ? 'fr-checkbox-buttons' : '', className)}
      legend={
        legend && (
          <span className="fr-label fr-text--medium fr-mb-2v">{legend}</span>
        )
      }
      disabled={isPending}
      options={options.map((option) => ({
        label: (
          <span className="fr-flex fr-justify-content-space-between fr-align-items-center fr-flex-gap-4v fr-width-full fr-height-full">
            <span className="fr-flex fr-direction-column">
              {option.label}
              {option.hint && (
                <span className="fr-text--xs fr-mb-0 fr-text-mention--grey fr-text--regular">
                  {option.hint}
                </span>
              )}
            </span>
            {option.extra?.illustration && (
              <img
                width={56}
                src={option.extra.illustration}
                alt=""
                className="fr-ml-2v"
              />
            )}
            {option.extra?.tooltips && (
              <span className="fr-position-absolute fr-top-0 fr-right-0 fr-no-hover-bg-content">
                <Tooltip
                  kind="click"
                  title={
                    <ul className="fr-mb-0 fr-raw-list">
                      {option.extra.tooltips.map((tooltip, index) => (
                        <li key={index}>{tooltip}</li>
                      ))}
                    </ul>
                  }
                />
              </span>
            )}
          </span>
        ),
        hintText: option.extra?.hintText,
        nativeInputProps: {
          name,
          value: option.value as string,
          checked: isChecked(option)(state),
          disabled: option.extra?.disabled,
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(
              e.target.checked ? setValue(e)(state) : removeValue(e)(state),
            ),
          ...option.nativeInputProps,
        },
      }))}
      {...props}
    />
  )
}
