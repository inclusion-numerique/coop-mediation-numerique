import { startTransition } from 'react'

export const handleAction =
  <TFormData>(action: (formData: TFormData) => void | Promise<void>) =>
  async ({ value }: { value: TFormData }) =>
    startTransition(() => action(value))
