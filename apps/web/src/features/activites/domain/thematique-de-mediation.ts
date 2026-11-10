import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const VALEURS = [
  'DiagnosticNumerique',
  'PrendreEnMainDuMateriel',
  'MaintenanceDeMateriel',
  'GereSesContenusNumeriques',
  'NavigationSurInternet',
  'Email',
  'Bureautique',
  'ReseauxSociaux',
  'Sante',
  'BanqueEtAchatsEnLigne',
  'Entrepreneuriat',
  'InsertionProfessionnelle',
  'SecuriteNumerique',
  'Parentalite',
  'ScolariteEtNumerique',
  'CreerAvecLeNumerique',
  'CultureNumerique',
  'IntelligenceArtificielle',
] as const

export const ThematiqueDeMediation = defineModel(
  z.enum(VALEURS).brand('ThematiqueDeMediation'),
)

export type ThematiqueDeMediation = Model.TypeOf<typeof ThematiqueDeMediation>

export const thematiquesDeMediation: readonly ThematiqueDeMediation[] =
  VALEURS.map(ThematiqueDeMediation)
