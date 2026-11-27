import {
  profilDepuisDispositif,
  type UtilisateurId,
} from '@/features/inscription/domain'
import type { Siret } from '@/libraries/insee'
import { type Result, success } from '@/libraries/result'
import { etapeApresInitialisation } from './etape-apres-initialisation'
import type {
  InscriptionInitialisee,
  RattachementParSiret,
} from './inscription-initialisee'
import type { InitialiserInscriptionPorts, RattacherDepuisSiret } from './ports'

const rattacherParSiret = async <Rattachement, Echec>(
  rattacherDepuisSiret: RattacherDepuisSiret<Rattachement, Echec>,
  userId: UtilisateurId,
  siret: Siret,
): Promise<RattachementParSiret<Rattachement, Echec>> => {
  const rattachement = await rattacherDepuisSiret({ userId, siret })

  return rattachement.success
    ? { _tag: 'Rattache', siret, rattachement: rattachement.data }
    : { _tag: 'NonRattache', siret, echec: rattachement.error }
}

export const initialiserInscription =
  <Rattachement, Echec>({
    lireLeDispositif,
    enregistrerLeProfil,
    garantirLeRoleCoordinateur,
    garantirLeMediateur,
    lireLeSiretARattacher,
    rattacherDepuisSiret,
    lireEtatPourEtapeSuivante,
  }: InitialiserInscriptionPorts<Rattachement, Echec>) =>
  async ({
    userId,
  }: {
    readonly userId: UtilisateurId
  }): Promise<Result<InscriptionInitialisee<Rattachement, Echec>, never>> => {
    const dispositif = await lireLeDispositif(userId)
    const profilDuDispositif = profilDepuisDispositif(dispositif)

    if (profilDuDispositif !== null)
      await enregistrerLeProfil({ userId, profil: profilDuDispositif })

    const { data: roleCoordinateur } = await garantirLeRoleCoordinateur({
      utilisateurId: userId,
    })

    const mediateurGaranti =
      dispositif.estConseillerNumerique && !dispositif.estCoordinateur

    if (mediateurGaranti) await garantirLeMediateur(userId)

    const { siret, aUneEmployeuse } = await lireLeSiretARattacher(userId)

    const rattachementParSiret: RattachementParSiret<Rattachement, Echec> =
      aUneEmployeuse
        ? { _tag: 'EmployeuseDejaConnue' }
        : siret === null
          ? { _tag: 'SansSiret' }
          : await rattacherParSiret(rattacherDepuisSiret, userId, siret)

    const etat = await lireEtatPourEtapeSuivante(userId)

    return success({
      profilEnregistre: profilDuDispositif,
      roleCoordinateur,
      mediateurGaranti,
      rattachementParSiret,
      nextStep: etapeApresInitialisation({
        connuDuDispositif: dispositif.connue,
        profil: profilDuDispositif ?? etat.profil,
        hasLieuxActivite: etat.hasLieuxActivite,
        isConseillerNumerique: dispositif.estConseillerNumerique,
      }),
    })
  }
