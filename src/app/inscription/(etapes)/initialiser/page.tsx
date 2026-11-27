import { redirect } from 'next/navigation'
import { geocoder } from '@/configuration/ban'
import { metadataTitle } from '@/configuration/projet'
import { aTermineSonInscription } from '@/features/authentification/domain/page-d-accueil'
import { authenticateUser } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { rattacherAUneEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/domain/rattacher-a-une-employeuse'
import { etablissementDepuisSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/api-entreprise/etablissement-depuis-siret.query'
import { statutDeConseillerNumerique } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/conseiller-numerique-en-poste.query'
import { creerLEmployeuse } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/creer-l-employeuse.mutation'
import { lireLesEmployeusesDuSiret } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/employeuses-du-siret.query'
import { enregistrerLeRattachement } from '@/features/employeuse/abilities/rattacher-a-une-employeuse/implementations/prisma/enregistrer-le-rattachement.mutation'
import { UtilisateurId as UtilisateurIdDeLEmployeuse } from '@/features/employeuse/domain'
import { initialiserInscription } from '@/features/inscription/abilities/initialiser-inscription/domain/initialiser-inscription'
import { dispositifDepuisMain } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/dispositif-depuis-main.query'
import { enregistrerLeProfil } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/enregistrer-le-profil.mutation'
import { lireEtatPourEtapeSuivante } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/etat-pour-etape-suivante.query'
import { garantirLeMediateur } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/garantir-le-mediateur.mutation'
import { lireLeSiretARattacher } from '@/features/inscription/abilities/initialiser-inscription/implementations/prisma/siret-a-rattacher.query'
import { UtilisateurId } from '@/features/inscription/domain'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import {
  ensurePersonneMain,
  synchroniserPersonne,
} from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { garantirLeRoleCoordinateurDuDispositif } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/domain/garantir-le-role-coordinateur-du-dispositif'
import { creerLeRoleCoordinateur } from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/creer-le-role-coordinateur.mutation'
import {
  aLeRoleCoordinateur,
  coordonneDansLeDispositif,
} from '@/features/utilisateurs/abilities/garantir-le-role-coordinateur-du-dispositif/implementations/prisma/role-coordinateur.query'
import { UtilisateurId as IdentifiantDuCompte } from '@/features/utilisateurs/domain'

const rattacher = rattacherAUneEmployeuse({
  lireLEtablissement: etablissementDepuisSiret,
  lireLeStatutDeConseillerNumerique: statutDeConseillerNumerique,
  lireLesEmployeusesDuSiret,
  creerLEmployeuse: creerLEmployeuse({ geocoder }),
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

  if (aTermineSonInscription(user)) {
    redirect('/coop')
  }

  const initialisation = await initialiserInscription({
    lireLeDispositif: dispositifDepuisMain,
    enregistrerLeProfil,
    garantirLeRoleCoordinateur: ({ utilisateurId }) =>
      garantirLeRoleCoordinateurDuDispositif({
        aLeRoleCoordinateur,
        coordonneDansLeDispositif,
        creerLeRoleCoordinateur: creerLeRoleCoordinateur(synchroniserPersonne),
      })({ utilisateurId: IdentifiantDuCompte(utilisateurId) }),
    garantirLeMediateur: garantirLeMediateur(synchroniserPersonne),
    lireLeSiretARattacher,
    rattacherDepuisSiret: ({ userId, siret }) =>
      rattacher({
        userId: UtilisateurIdDeLEmployeuse(userId),
        source: { _tag: 'Siret', siret },
      }),
    lireEtatPourEtapeSuivante,
  })({ userId: UtilisateurId(user.id) })

  redirect(cheminDeLEtape(initialisation.data.nextStep))
}

export default InitialiserInscriptionPage
