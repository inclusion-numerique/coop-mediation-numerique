'use client'

import { Toaster as BaseToaster } from 'react-hot-toast'

const Toaster = () => (
  <BaseToaster
    position="top-center"
    reverseOrder={false}
    containerClassName="fr-no-print"
    gutter={8}
    toastOptions={{
      duration: 10_000,
    }}
  />
)

export default Toaster
