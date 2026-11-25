import {
  Select as DsfrSelect,
  SelectProps as DsfrSelectProps,
} from '@codegouvfr/react-dsfr/SelectNext'

import Option = DsfrSelectProps.Option

import classNames from 'classnames'
import { ChangeEvent } from 'react'
import { useFieldContext } from '@/libraries/formulaire/form-context'
import { Label } from './Label'

type SelectProps<T extends Option<string>[]> = Omit<
  DsfrSelectProps<T>,
  'name'
> & {
  isPending: boolean
}

export const Select = <T extends Option<string>[]>({
  isPending,
  label,
  ...props
}: SelectProps<T>) => {
  const { name, state, handleBlur, handleChange } = useFieldContext<string>()
  const errors: Error[] = state.meta.errors
  const hasErrors = errors.length > 0 && state.meta.isTouched
  const message = hasErrors ? errors[0]?.message : undefined

  return (
    <DsfrSelect
      {...(hasErrors ? { state: 'error' as const } : {})}
      {...(message === undefined ? {} : { stateRelatedMessage: message })}
      label={<Label hasErrors={hasErrors}>{label}</Label>}
      disabled={isPending}
      nativeSelectProps={{
        name,
        value: state.value,
        onBlur: handleBlur,
        onChange: (e: ChangeEvent<HTMLSelectElement>) =>
          handleChange(e.target.value),
        className: classNames('fr-select--white', props.className),
      }}
      {...props}
    />
  )
}
