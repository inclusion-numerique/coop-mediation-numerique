import type { ValeurDeSlugOutil } from '../../domain'
import abcDiag from './abcDiag'
import aidantsConnect from './aidantsConnect'
import cartographieNationale from './cartographieNationale'
import type { FicheOutil } from './fiche-outil'
import lesBases from './lesBases'
import monInclusionNumerique from './monInclusionNumerique'
import pix from './pix'
import rdv from './rdv'

export type SitesDesOutils = {
  readonly rdvServicePublic: string
}

const fiches = (
  sites: SitesDesOutils,
): Record<ValeurDeSlugOutil, FicheOutil> => ({
  'abc-diag': abcDiag,
  'aidants-connect': aidantsConnect,
  'cartographie-nationale-des-lieux-d-inclusion-numerique':
    cartographieNationale,
  'les-bases-du-numerique-d-interet-general': lesBases,
  'mon-inclusion-numerique': monInclusionNumerique,
  pix,
  'rdv-service-public': rdv(sites.rdvServicePublic),
})

export const ficheDeLOutil = (
  slug: ValeurDeSlugOutil,
  sites: SitesDesOutils,
): FicheOutil => fiches(sites)[slug]
