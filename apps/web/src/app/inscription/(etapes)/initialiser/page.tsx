import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { initializeInscription } from '@app/web/features/inscription/use-cases/initialize/initializeInscription'
import * as Sentry from '@sentry/nextjs'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Inscription'),
}

const InitialiserInscriptionPage = async () => {
  const user = await authenticateUser()

  // If inscription is already validated, redirect to coop
  if (user.inscriptionValidee) {
    redirect('/coop')
  }

  // Initialize inscription and get next step
  const result = await initializeInscription({
    userId: user.id,
    email: user.email,
  })

  // Redirect to next step or fallback
  if (result.nextStepPath) {
    redirect(result.nextStepPath)
  }

  // Capture sentry error if no next step determined
  Sentry.captureException(
    new Error('No next step determined for inscription'),
    {
      extra: {
        userId: user.id,
        email: user.email,
        initializeInscriptionResult: result,
      },
    },
  )
  // Fallback if no next step determined
  redirect('/coop')
}

export default InitialiserInscriptionPage
