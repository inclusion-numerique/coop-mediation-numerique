import type { ReactNode } from 'react'
import { Pictogram } from '@/libraries/pictograms'
import type { ValeurDeSlugOutil } from '../../domain/index'
import abcDiag from '../labels/fiches/abc-diag.labels'
import aidantsConnect from '../labels/fiches/aidants-connect.labels'
import cartographieNationale from '../labels/fiches/cartographie-nationale.labels'
import lesBases from '../labels/fiches/les-bases.labels'
import monInclusionNumerique from '../labels/fiches/mon-inclusion-numerique.labels'
import pix from '../labels/fiches/pix.labels'
import rdv from '../labels/fiches/rdv.labels'

type FonctionnaliteDeLOutil = {
  title: string
  description: string
  icon: string
  link?: string
}

export type InformationDAcces = {
  label: string
  link: string
  share?: boolean
}

export type AccesALOutil = {
  how: ReactNode
  icon?: string
  illustration?: string
  info?: InformationDAcces
  title?: string
  description?: string
  callToActionComponent?: ReactNode
  callToAction?: {
    label: string
    link: string
  }
}

export type FicheOutil = {
  notice?: string
  title: string
  description: string
  website: string
  websiteLinkLabel?: string
  pictogram: Pictogram
  illustration: string
  illustrationWidth?: number
  features?: FonctionnaliteDeLOutil[]
  access?: AccesALOutil
  how?: ReactNode
  more?: ReactNode
  classes?: {
    access?: string
  }
}

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
