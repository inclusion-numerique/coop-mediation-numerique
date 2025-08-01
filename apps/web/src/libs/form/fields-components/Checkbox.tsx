import { Pictogram } from '@app/web/features/pictograms/pictogram'
import { useFieldContext } from '@app/web/libs/form/form-context'
import {
  Checkbox as DsfrCheckbox,
  CheckboxProps as DsfrCheckboxProps,
} from '@codegouvfr/react-dsfr/Checkbox'
import { Tooltip } from '@codegouvfr/react-dsfr/Tooltip'
import classNames from 'classnames'
import {
  ChangeEvent,
  DetailedHTMLProps,
  LabelHTMLAttributes,
  ReactNode,
} from 'react'

type CheckboxProps<T> = Omit<DsfrCheckboxProps, 'name' | 'options'> & {
  isPending: boolean
  isTiled?: boolean
  options: {
    label: ReactNode
    value: T
    hint?: string
    extra?: {
      illustration?: string | Pictogram
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

const toggleValueFor =
  <T extends any>(option: { value: T }) =>
  (value: T) =>
    value !== option.value

const arrayOrEmpty = <T extends any>(value: T[] | T | null) =>
  Array.isArray(value) ? value : []

const setValue =
  <T,>(option: { value: T }, isSingleCheckbox: boolean) =>
  ({ value }: { value: T | T[] | null }) =>
    isSingleCheckbox
      ? option.value
      : [...arrayOrEmpty(value), option.value as T]

const removeValue =
  <T,>(option: { value: T }, isSingleCheckbox: boolean) =>
  ({ value }: { value: T | T[] | null }) =>
    isSingleCheckbox ? null : arrayOrEmpty(value).filter(toggleValueFor(option))

const isChecked =
  <T,>(option: { value: T }, isSingleCheckbox: boolean) =>
  ({ value }: { value: T | T[] | null }) =>
    isSingleCheckbox
      ? value === option.value
      : arrayOrEmpty(value).includes(option.value)

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
    <extra.illustration width={56} height={56} />
  )
}

export const Checkbox = <T,>({
  isPending,
  legend,
  options,
  isTiled = true,
  className,
  ...props
}: CheckboxProps<T>) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<
    T | T[] | null
  >()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched
  const isSingleCheckbox = options.length === 1

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
            <Illustration extra={option.extra} />
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
          checked: isChecked(option, isSingleCheckbox)(state),
          disabled: option.extra?.disabled,
          onBlur: handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) =>
            handleChange(
              e.target.checked
                ? setValue(option, isSingleCheckbox)(state)
                : removeValue(option, isSingleCheckbox)(state),
            ),
          ...option.nativeInputProps,
        },
      }))}
      {...props}
    />
  )
}
