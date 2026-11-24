import classNames from 'classnames'
import type {
  ChangeEventHandler,
  HTMLInputTypeAttribute,
  HTMLProps,
  ReactNode,
} from 'react'
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form'
import RedAsterisk from '@/libraries/ui/form/RedAsterisk'
import { UiComponentProps } from '@/libraries/ui/utils/ui-component-props'

type CommonProps<T extends FieldValues> = {
  control: Control<T>
  path: FieldPath<T>
  disabled?: boolean | undefined
  label?: ReactNode | undefined
  hint?: ReactNode | undefined
  placeholder?: string | undefined
  valid?: string | undefined
  icon?: string | undefined
  info?: ReactNode | ((value?: string | null) => ReactNode) | undefined
  asterisk?: boolean | undefined
  classes?:
    | {
        container?: string | undefined
        label?: string | undefined
        input?: string | undefined
        inputWrap?: string | undefined
      }
    | undefined
  inputPre?: ReactNode | undefined
  inputPost?: ReactNode | undefined
  labelSrOnly?: boolean | undefined
}

type InputProps = {
  type?: Exclude<HTMLInputTypeAttribute, 'checkbox' | 'textarea'> | undefined
  min?: number | string | undefined
  max?: number | string | undefined
  step?: number | string | undefined
}

type TextareaProps = {
  type: 'textarea'
} & Omit<
  HTMLProps<HTMLTextAreaElement>,
  'onChange' | 'onBlur' | 'value' | 'ref' | 'id' | 'aria-describedby'
>

export type InputFormFieldProps<T extends FieldValues = FieldValues> =
  CommonProps<T> & (InputProps | TextareaProps)

const InputFormField = <T extends FieldValues = FieldValues>({
  label,
  path,
  control,
  placeholder,
  type = 'text',
  hint,
  disabled,
  className,
  'data-testid': dataTestId,
  valid,
  icon,
  info,
  asterisk,
  classes,
  inputPost,
  inputPre,
  labelSrOnly = false,
  ...rest
}: UiComponentProps & InputFormFieldProps<T>) => {
  const id = `input-form-field__${path}`

  return (
    <Controller
      control={control}
      name={path}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { invalid, isTouched, error },
      }) => {
        let ariaDescribedBy: string | undefined
        if (error) {
          ariaDescribedBy = `${id}__error`
        } else if (valid && isTouched && !invalid) {
          ariaDescribedBy = `${id}__valid`
        }

        const inputOnChange: ChangeEventHandler<HTMLInputElement> =
          type === 'number'
            ? (event) => {
                const eventValue = event.target?.value
                if (!eventValue || typeof eventValue !== 'string') {
                  onChange(null)
                  return
                }
                onChange(Number.parseFloat(eventValue))
              }
            : onChange

        const input =
          type === 'textarea' ? (
            <textarea
              data-testid={dataTestId}
              className={classNames('fr-input', classes?.input)}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              id={id}
              placeholder={placeholder}
              onBlur={onBlur}
              onChange={onChange}
              value={value ?? ''}
              ref={ref}
              {...rest}
            />
          ) : (
            <input
              data-testid={dataTestId}
              className={classNames('fr-input', classes?.input)}
              aria-describedby={ariaDescribedBy}
              disabled={disabled}
              type={type}
              id={id}
              placeholder={placeholder}
              onBlur={onBlur}
              onChange={inputOnChange}
              value={value ?? ''}
              ref={ref}
              min={rest.min}
              max={rest.max}
              step={rest.step}
            />
          )

        return (
          <div
            className={classNames(
              'fr-input-group',
              {
                'fr-input-group--error': error,
                'fr-input-group--disabled': disabled,
                'fr-input-group--valid': valid && isTouched && !invalid,
              },
              className,
            )}
          >
            <label
              className={classNames(
                labelSrOnly ? 'fr-sr-only' : 'fr-label fr-mb-1v',
                classes?.label,
              )}
              htmlFor={id}
            >
              {label} {asterisk && <RedAsterisk />}
              {hint && <span className="fr-hint-text">{hint}</span>}
            </label>
            <div
              className={classNames(
                !!icon && `fr-input-wrap`,
                icon,
                classes?.inputWrap,
              )}
            >
              {inputPre}
              {input}
              {inputPost}
            </div>
            {info && (
              <p id={`${id}__info`} className="fr-hint-text fr-mt-1v fr-mb-0">
                {typeof info === 'function' ? info(value) : info}
              </p>
            )}
            {error && (
              <p
                id={`${id}__error`}
                className={classNames('fr-error-text fr-width-full', {
                  'fr-mt-1v': !!info,
                })}
              >
                {error.message}
              </p>
            )}
            {valid && isTouched && !invalid && (
              <p
                id={`${id}__valid`}
                className={classNames('fr-valid-text', { 'fr-mt-1v': !!info })}
              >
                {valid}
              </p>
            )}
          </div>
        )
      }}
    />
  )
}

export default InputFormField
