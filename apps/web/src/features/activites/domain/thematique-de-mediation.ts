import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const THEMATIQUES_DE_MEDIATION = [
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
  z.enum(THEMATIQUES_DE_MEDIATION).brand('ThematiqueDeMediation'),
)

export type ThematiqueDeMediation = Model.TypeOf<typeof ThematiqueDeMediation>

export const thematiquesDeMediation: readonly ThematiqueDeMediation[] =
  THEMATIQUES_DE_MEDIATION.map(ThematiqueDeMediation)
