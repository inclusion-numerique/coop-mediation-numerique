import { pluriel } from '@app/web/libraries/pluriel'
import { type ProfilActeur, profilAffiche } from '../domain'

type Profil =
  | 'ConseillerNumerique'
  | 'Mediateur'
  | 'CoordinateurConseillerNumerique'
  | 'CoordinateurHorsDispositif'

const LIBELLE_DU_PROFIL: Readonly<Record<Profil, string>> = {
  ConseillerNumerique: 'Conseiller·ère numérique',
  Mediateur: 'Médiateur·rice numérique',
  CoordinateurConseillerNumerique:
    'Coordinateur·rice de conseillers numériques',
  CoordinateurHorsDispositif: 'Coordinateur·rice hors dispositif',
}

const ICONE_DU_PROFIL: Readonly<Record<Profil, string | null>> = {
  ConseillerNumerique:
    '/images/iconographie/profil-conseiller-numerique-minimal.svg',
  Mediateur: null,
  CoordinateurConseillerNumerique:
    '/images/iconographie/profil-coordinateur-conseiller-numerique-minimal.svg',
  CoordinateurHorsDispositif: null,
}

const profilDe = (profil: ProfilActeur): Profil => profilAffiche(profil)

export const libelleDuProfil = (profil: ProfilActeur): string =>
  LIBELLE_DU_PROFIL[profilDe(profil)]

export const iconeDuProfil = (profil: ProfilActeur): string | null =>
  ICONE_DU_PROFIL[profilDe(profil)]

export const libelleDesLieux = (nombre: number): string =>
  `${nombre} ${pluriel(nombre, 'lieu', 'lieux')} d’activité`
