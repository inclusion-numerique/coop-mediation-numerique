import { AnyFormApi } from '@tanstack/react-form'
import { FormEvent } from 'react'
import { scrollToError } from '@/libraries/ui/hooks'

export const handleSubmit =
  (form: AnyFormApi) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    await form.handleSubmit().then(scrollToError)
  }
