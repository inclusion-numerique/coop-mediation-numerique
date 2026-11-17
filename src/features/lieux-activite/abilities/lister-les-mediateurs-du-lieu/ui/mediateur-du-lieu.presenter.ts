import { pluriel } from '@app/web/libraries/pluriel'
import type { DerniereActiviteIci, ProfilDuMediateur } from '../domain'

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

export const libelleDuProfil = (profil: ProfilDuMediateur): string => {
  const cle: Profil = profil
  return LIBELLE_DU_PROFIL[cle]
}

export const iconeDuProfil = (profil: ProfilDuMediateur): string | null => {
  const cle: Profil = profil
  return ICONE_DU_PROFIL[cle]
}

export const hrefDeLActeur = (
  departement: string,
  acteurId: string,
  ancre?: string,
): string =>
  `/coop/mon-reseau/${departement}/acteurs/${acteurId}${ancre === undefined ? '' : `#${ancre}`}`

export const libelleDesLieux = (nombre: number): string =>
  `${nombre} ${pluriel(nombre, 'lieu', 'lieux')} d’activité`

export const dateDeDerniereActivite = (
  derniere: DerniereActiviteIci,
): Date | null => (derniere._tag === 'Le' ? derniere.date : null)
