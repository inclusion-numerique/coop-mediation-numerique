import { redirect } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet'
import { errorReporter } from '@/configuration/telemetry/serveur'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import { rattacherAUneEmployeuseDepuisSiretBinding } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
import { initialiserInscriptionAvecInfra } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/initialiser-inscription.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'

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
  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  const { nextStep } = await initialiserInscriptionAvecInfra(
    { userId: UtilisateurId(user.id) },
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
    redirect(cheminDeLEtape(nextStep))
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
