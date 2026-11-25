import { redirect } from 'next/navigation'
import { geocoder } from '@/configuration/ban'
import { metadataTitle } from '@/configuration/projet'
import { errorReporter, signaler } from '@/configuration/telemetry/serveur'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import type { RegistreDesPersonnes } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-a-une-employeuse.mutation'
import { rattacherAUneEmployeuseDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/rattacher-depuis-siret.mutation'
import { initialiserInscriptionAvecInfra } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/initialiser-inscription.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'

const services = {
  geocoder,
  signaler,
  etablissementDepuisSiret,
}

const rattacherDepuisLeSiretAvec = (registre: RegistreDesPersonnes) =>
  rattacherAUneEmployeuseDepuisSiret({ ...services, ...registre })

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
      rattacherDepuisSiret: rattacherDepuisLeSiretAvec(registreDesPersonnes),
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
