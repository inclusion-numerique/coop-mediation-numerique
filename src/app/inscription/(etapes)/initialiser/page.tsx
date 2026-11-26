import { redirect } from 'next/navigation'
import { geocoder } from '@/configuration/ban'
import { metadataTitle } from '@/configuration/projet'
import { signaler } from '@/configuration/telemetry/serveur'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { estConseillerNumeriqueEnPoste } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import { initialiserInscriptionAvecInfra } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/initialiser-inscription.mutation'
import { UtilisateurId } from '@/features/inscription/domain'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/garantir-le-role-coordinateur.mutation'

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  estConseillerNumeriqueEnPoste,
  lireLesEmployeusesDuSiret: lireLesEmployeusesDuSiret(signaler),
  creerLEmployeuse: creerLEmployeuse({ geocoder, signaler }),
  enregistrerLeRattachement: enregistrerLeRattachement({
    garantirLaPersonne: ensurePersonneMain,
    synchroniserLaPersonne: synchroniserPersonne,
  }),
})

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
      rattacherDepuisSiret: ({ userId, siret }) =>
        rattacher({ userId, source: { _tag: 'Siret', siret } }),
      garantirLeRoleCoordinateur:
        garantirLeRoleCoordinateurDuDispositif(synchroniserPersonne),
      synchroniserLaPersonne: synchroniserPersonne,
    },
  )

  redirect(cheminDeLEtape(nextStep))
}

export default InitialiserInscriptionPage
