'use client'

import { signaler } from '@app/web/configuration/telemetry/error-reporter/client/signaler'
import NextError from 'next/error'
import { useEffect } from 'react'

const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  useEffect(() => {
    signaler(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}

export default GlobalError
