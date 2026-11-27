import { ProfilInscription } from './profil-inscription'

export type DispositifPersonne = {
  readonly connue: boolean
  readonly estConseillerNumerique: boolean
  readonly estCoordinateur: boolean
}

export const profilDepuisDispositif = ({
  connue,
  estConseillerNumerique,
  estCoordinateur,
}: DispositifPersonne): ProfilInscription | null => {
  if (!connue) return null
  if (estCoordinateur && estConseillerNumerique)
    return ProfilInscription('CoordinateurConseillerNumerique')
  if (estCoordinateur) return ProfilInscription('Coordinateur')
  if (estConseillerNumerique) return ProfilInscription('ConseillerNumerique')
  return ProfilInscription('Mediateur')
}
