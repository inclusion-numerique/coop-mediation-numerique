import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import { initialiserInscriptionAvecInfra } from '@app/web/features/inscription/abilities/initialiser-inscription/implementation'
import { Email, UserId } from '@app/web/features/inscription/domain'
import { stepPath } from '@app/web/features/inscription/ui/step-path'
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

  const { nextStep } = await initialiserInscriptionAvecInfra({
    userId: UserId(user.id),
    email: Email(user.email),
  })

  // Redirect to next step or fallback
  if (nextStep) {
    redirect(stepPath(nextStep))
  }

  // Capture sentry error if no next step determined
  Sentry.captureException(
    new Error('No next step determined for inscription'),
    {
      extra: { userId: user.id, email: user.email },
    },
  )
  // Fallback if no next step determined
  redirect('/coop')
}

export default InitialiserInscriptionPage
