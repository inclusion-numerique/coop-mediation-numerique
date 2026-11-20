import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { errorReporter } from '@/configuration/telemetry/error-reporter/server'
import { hasInscriptionComplete } from '@/features/authentification/domain/getHomepage'
import { authenticateUser } from '@/features/authentification/implementation/session/authenticateUser'
import { rattacherAUneEmployeuseDepuisSiretBinding } from '@/features/employeuse/server'
import { initialiserInscriptionAvecInfra } from '@/features/inscription/abilities/initialiser-inscription/implementation'
import { UserId } from '@/features/inscription/domain'
import { stepPath } from '@/features/inscription/ui/step-path'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif'

const registreDesPersonnes = {
  garantirLaPersonne: ensurePersonneMain,
  synchroniserLaPersonne: synchroniserPersonne,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: metadataTitle('Inscription'),
}

const InitialiserInscriptionPage = async () => {
  const user = await authenticateUser()

  // If inscription is already complete (validated with a role profile), redirect to coop
  if (hasInscriptionComplete(user)) {
    redirect('/coop')
  }

  const { nextStep } = await initialiserInscriptionAvecInfra(
    { userId: UserId(user.id) },
    {
      rattacherDepuisSiret:
        rattacherAUneEmployeuseDepuisSiretBinding(registreDesPersonnes),
      garantirLeRoleCoordinateur:
        garantirLeRoleCoordinateurDuDispositif(synchroniserPersonne),
      synchroniserLaPersonne: synchroniserPersonne,
    },
  )

  // Redirect to next step or fallback
  if (nextStep) {
    redirect(stepPath(nextStep))
  }

  // Capture sentry error if no next step determined
  errorReporter.captureException({
    error: new Error('No next step determined for inscription'),
    attributes: { userId: user.id },
  })
  // Fallback if no next step determined
  redirect('/coop')
}

export default InitialiserInscriptionPage
