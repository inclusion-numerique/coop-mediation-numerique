import { acteurDe, type ProfilDeLActeur } from '../../../../domain'
import { tousLesTagsVisiblesPar } from './tags-visibles-par'

export const tagsVisiblesDuProfil = (profil: ProfilDeLActeur) =>
  tousLesTagsVisiblesPar(acteurDe(profil))
