import { createFormHook } from '@tanstack/react-form'
import { type ReactNode, lazy } from 'react'
import { type ComboBoxProps } from './fields-components/ComboBox'
import { SelectedItemProps } from './fields-components/SelectedItems'
import { fieldContext, formContext } from './form-context'

export type DefaultValues<T> = { [K in keyof T]?: DefaultValues<T[K]> }

const Checkbox = lazy(() =>
  import('./fields-components/Checkbox').then((module) => ({
    default: module.Checkbox,
  })),
)

const ComboBox = lazy(() =>
  import('./fields-components/ComboBox').then((module) => ({
    default: module.ComboBox,
  })),
) as <TItem, TPayload extends object>(
  props: ComboBoxProps<TItem, TPayload>,
) => ReactNode

const Input = lazy(() =>
  import('./fields-components/Input').then((module) => ({
    default: module.Input,
  })),
)

const RadioButtons = lazy(() =>
  import('./fields-components/RadioButtons').then((module) => ({
    default: module.RadioButtons,
  })),
)

const RichTextarea = lazy(() =>
  import('./fields-components/RichTextarea').then((module) => ({
    default: module.RichTextarea,
  })),
)

const Select = lazy(() =>
  import('./fields-components/Select').then((module) => ({
    default: module.Select,
  })),
)

const SelectedItems = lazy(() =>
  import('./fields-components/SelectedItems').then((module) => ({
    default: module.SelectedItems,
  })),
) as <TItem extends object>(props: SelectedItemProps<TItem>) => ReactNode

const Stepper = lazy(() =>
  import('./fields-components/Stepper').then((module) => ({
    default: module.Stepper,
  })),
)

const StepperStacked = lazy(() =>
  import('./fields-components/StepperStacked').then((module) => ({
    default: module.StepperStacked,
  })),
)

const Submit = lazy(() =>
  import('./form-components/submit.form').then((module) => ({
    default: module.Submit,
  })),
)

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Checkbox,
    ComboBox,
    Input,
    RadioButtons,
    RichTextarea,
    Select,
    SelectedItems,
    Stepper,
    StepperStacked,
  },
  formComponents: { Submit },
})
