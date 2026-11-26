import {
  profilDepuisDispositif,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { type Result, success } from '@/libraries/result'
import { etapeApresInitialisation } from './etape-apres-initialisation'
import type { InscriptionInitialisee } from './inscription-initialisee'
import type { InitialiserInscriptionPorts } from './ports'

export const initialiserInscription =
  ({
    lireLeDispositif,
    enregistrerLeProfil,
    garantirLeRoleCoordinateur,
    garantirLeMediateur,
    lireLeSiretARattacher,
    rattacherDepuisSiret,
    lireEtatPourEtapeSuivante,
  }: InitialiserInscriptionPorts) =>
  async ({
    userId,
  }: {
    readonly userId: UtilisateurId
  }): Promise<Result<InscriptionInitialisee, never>> => {
    const dispositif = await lireLeDispositif(userId)
    const profilDuDispositif = profilDepuisDispositif(dispositif)

    if (profilDuDispositif !== null)
      await enregistrerLeProfil({ userId, profil: profilDuDispositif })

    await garantirLeRoleCoordinateur(userId)

    const mediateurGaranti =
      dispositif.estConseillerNumerique && !dispositif.estCoordinateur

    if (mediateurGaranti) await garantirLeMediateur(userId)

    const { siret, aUneEmployeuse } = await lireLeSiretARattacher(userId)
    const siretRattache = aUneEmployeuse ? null : siret

    if (siretRattache !== null)
      await rattacherDepuisSiret({ userId, siret: siretRattache })

    const etat = await lireEtatPourEtapeSuivante(userId)

    return success({
      profilEnregistre: profilDuDispositif,
      mediateurGaranti,
      siretRattache,
      nextStep: etapeApresInitialisation({
        connuDuDispositif: dispositif.connue,
        profil: profilDuDispositif ?? etat.profil,
        hasLieuxActivite: etat.hasLieuxActivite,
        isConseillerNumerique: dispositif.estConseillerNumerique,
      }),
    })
  }
