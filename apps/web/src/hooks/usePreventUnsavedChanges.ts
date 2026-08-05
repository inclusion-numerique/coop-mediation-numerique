import 'client-only'
import { isBrowser } from '@app/web/utils/isBrowser'
import { useEffect } from 'react'
import { FieldValues, FormState } from 'react-hook-form'

export const usePreventUnsavedChanges = <T extends FieldValues>({
  formState: { isDirty },
}: {
  formState: FormState<T>
}) => {
  useEffect(() => {
    if (isBrowser) {
      return
    }
    const confirmLeave = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.returnValue = 'Your unsaved changes will be lost'
      }
    }
    window.addEventListener('beforeunload', confirmLeave)

    return () => {
      window.removeEventListener('beforeunload', confirmLeave)
    }
  }, [isDirty])
}
