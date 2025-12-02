import { labelsToOptions } from '@app/ui/components/Form/utils/options'

export const statutSlugs = [
  'inscription0',
  'inscription7',
  'inscription30',
  'inscription60',
  'inscription90',
  'nouveau0',
  'nouveau7',
  'nouveau30',
  'nouveau60',
  'nouveau90',
  'actif',
  'inactif30',
  'inactif90',
  'inactif180',
  'deleted',
] as const

export type Statut =
  | 'Inscription0'
  | 'Inscription7'
  | 'Inscription30'
  | 'Inscription60'
  | 'Inscription90'
  | 'Nouveau0'
  | 'Nouveau7'
  | 'Nouveau30'
  | 'Nouveau60'
  | 'Nouveau90'
  | 'Actif'
  | 'Inactif30'
  | 'Inactif90'
  | 'Inactif180'
  | 'Deleted'

export type StatutSlug = (typeof statutSlugs)[number]

export const statutLabels: {
  [key in Statut]: string
} = {
  Inscription0: 'Inscription en cours',
  Inscription7: 'Inscription en cours J+7',
  Inscription30: 'Inscription en cours J+30',
  Inscription60: 'Inscription en cours J+60',
  Inscription90: 'Inscription en cours J+90',
  Nouveau0: 'Nouveau',
  Nouveau7: 'Nouveau J+7',
  Nouveau30: 'Nouveau J+30',
  Nouveau60: 'Nouveau J+60',
  Nouveau90: 'Nouveau J+90',
  Actif: 'Actif',
  Inactif30: 'Inactif J+30',
  Inactif90: 'Inactif J+90',
  Inactif180: 'Inactif J+180',
  Deleted: 'Supprimé',
}

export const statutForSlug: { [key in StatutSlug]: Statut } = {
  inscription0: 'Inscription0',
  inscription7: 'Inscription7',
  inscription30: 'Inscription30',
  inscription60: 'Inscription60',
  inscription90: 'Inscription90',
  nouveau0: 'Nouveau0',
  nouveau7: 'Nouveau7',
  nouveau30: 'Nouveau30',
  nouveau60: 'Nouveau60',
  nouveau90: 'Nouveau90',
  actif: 'Actif',
  inactif30: 'Inactif30',
  inactif90: 'Inactif90',
  inactif180: 'Inactif180',
  deleted: 'Deleted',
}

export const statutSlugLabels: {
  [key in StatutSlug]: string
} = {
  inscription0: statutLabels[statutForSlug.inscription0],
  inscription7: statutLabels[statutForSlug.inscription7],
  inscription30: statutLabels[statutForSlug.inscription30],
  inscription60: statutLabels[statutForSlug.inscription60],
  inscription90: statutLabels[statutForSlug.inscription90],
  nouveau0: statutLabels[statutForSlug.nouveau0],
  nouveau7: statutLabels[statutForSlug.nouveau7],
  nouveau30: statutLabels[statutForSlug.nouveau30],
  nouveau60: statutLabels[statutForSlug.nouveau60],
  nouveau90: statutLabels[statutForSlug.nouveau90],
  actif: statutLabels[statutForSlug.actif],
  inactif30: statutLabels[statutForSlug.inactif30],
  inactif90: statutLabels[statutForSlug.inactif90],
  inactif180: statutLabels[statutForSlug.inactif180],
  deleted: statutLabels[statutForSlug.deleted],
}

export const statutSlugOptions = labelsToOptions(statutSlugLabels)
