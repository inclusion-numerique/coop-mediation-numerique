import {
  DEPARTEMENT_PAR_DEFAUT,
  departementDeLActeur,
} from '@/libraries/departement'
import type {
  Acteur,
  ActeurAvecCommunes,
  CoordinateurAvecCommune,
  CoordinateurDeLActeur,
  Mediation,
  MediationAvecCommunes,
  ProfilActeur,
} from './acteur'

const situer = ({
  communeDeLEmployeuse,
  ...identite
}: CoordinateurAvecCommune): CoordinateurDeLActeur => ({
  ...identite,
  departement:
    departementDeLActeur({ employeuse: communeDeLEmployeuse, lieux: [] }) ??
    DEPARTEMENT_PAR_DEFAUT,
})

const situerLaMediation = (mediation: MediationAvecCommunes): Mediation => ({
  ...mediation,
  coordinateurs: mediation.coordinateurs.map(situer),
})

const situerLeProfil = (
  profil: ProfilActeur<CoordinateurAvecCommune>,
): ProfilActeur => {
  if (profil._tag === 'Mediateur')
    return { ...profil, mediation: situerLaMediation(profil.mediation) }
  return {
    ...profil,
    mediation:
      profil.mediation === null ? null : situerLaMediation(profil.mediation),
  }
}

export const situerLesCoordinateurs = (acteur: ActeurAvecCommunes): Acteur => ({
  ...acteur,
  profil: situerLeProfil(acteur.profil),
})
