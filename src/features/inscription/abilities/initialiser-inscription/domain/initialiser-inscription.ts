import {
  type EtapeDInscription,
  profilDepuisDispositif,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { etapeApresInitialisation } from './etape-apres-initialisation'
import type { InitialiserInscriptionPorts } from './ports'

export type InitialiserInscription = (
  input: { readonly userId: UtilisateurId },
  ports: InitialiserInscriptionPorts,
) => Promise<{ readonly nextStep: EtapeDInscription }>

export const initialiserInscription: InitialiserInscription = async (
  { userId },
  {
    lireLeDispositif,
    enregistrerLeProfil,
    garantirLeRoleCoordinateur,
    garantirLeMediateur,
    importerStructureDepuisSiret,
    lireEtatPourEtapeSuivante,
  },
) => {
  const dispositif = await lireLeDispositif(userId)
  const profilDuDispositif = profilDepuisDispositif(dispositif)

  if (profilDuDispositif !== null)
    await enregistrerLeProfil({ userId, profil: profilDuDispositif })

  await garantirLeRoleCoordinateur(userId)

  if (dispositif.estConseillerNumerique && !dispositif.estCoordinateur)
    await garantirLeMediateur(userId)

  await importerStructureDepuisSiret(userId)
  const etat = await lireEtatPourEtapeSuivante(userId)

  return {
    nextStep: etapeApresInitialisation({
      connuDuDispositif: dispositif.connue,
      profil: profilDuDispositif ?? etat.profil,
      hasLieuxActivite: etat.hasLieuxActivite,
      isConseillerNumerique: dispositif.estConseillerNumerique,
    }),
  }
}
