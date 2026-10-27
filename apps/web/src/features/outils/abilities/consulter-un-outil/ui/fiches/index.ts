import type { SlugOutil, ValeurDeSlugOutil } from '../../domain'
import type { FicheOutil } from '../fiche-outil'
import abcDiag from './abcDiag'
import aidantsConnect from './aidantsConnect'
import cartographieNationale from './cartographieNationale'
import lesBases from './lesBases'
import monInclusionNumerique from './monInclusionNumerique'
import pix from './pix'
import rdv from './rdv'

const fiches: Record<ValeurDeSlugOutil, FicheOutil> = {
  'abc-diag': abcDiag,
  'aidants-connect': aidantsConnect,
  'cartographie-nationale-des-lieux-d-inclusion-numerique':
    cartographieNationale,
  'les-bases-du-numerique-d-interet-general': lesBases,
  'mon-inclusion-numerique': monInclusionNumerique,
  pix,
  'rdv-service-public': rdv,
}

const valeurDuSlug = (slug: SlugOutil): ValeurDeSlugOutil => slug

export const ficheDeLOutil = (slug: SlugOutil): FicheOutil =>
  fiches[valeurDuSlug(slug)]
