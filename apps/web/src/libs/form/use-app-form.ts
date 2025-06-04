import { lazy } from 'react'
import { createFormHook } from '@tanstack/react-form'
import { fieldContext, formContext } from './form-context'

const Input = lazy(() =>
  import('./fields/Input').then((module) => ({ default: module.Input })),
)
const InputGroup = lazy(() =>
  import('./fields/InputGroup').then((module) => ({
    default: module.InputGroup,
  })),
)
const RadioButtons = lazy(() =>
  import('./fields/RadioButtons').then((module) => ({
    default: module.RadioButtons,
  })),
)
const Select = lazy(() =>
  import('./fields/Select').then((module) => ({ default: module.Select })),
)

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    Input,
    InputGroup,
    RadioButtons,
    Select,
  },
  formComponents: {},
})
