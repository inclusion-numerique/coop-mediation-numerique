'use client'

export const scrollToError = () => {
  const errorElement = document.querySelector(
    'form .fr-error-text, form .fr-message--error',
  )
  if (!errorElement) {
    return
  }
  errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
