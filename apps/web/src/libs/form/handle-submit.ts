import { scrollToError } from '@app/ui/hooks/useScrollToError'
import { AnyFormApi } from '@tanstack/react-form'
import { FormEvent } from 'react'

export const handleSubmit =
  (form: AnyFormApi) => async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    await form.handleSubmit().then(scrollToError)
  }
