import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const relances = [
  'Aucune',
  'J7',
  'J30',
  'J60',
  'AvertissementJ90',
] as const

export const Relance = defineModel(z.enum(relances).brand('Relance'))

export type Relance = Model.TypeOf<typeof Relance>

export type PhaseDeRelance = 'Inscription' | 'Nouveau'

export type PalierDeRelance = 7 | 30 | 60

export type ActionDeRelance =
  | { readonly _tag: 'Rien' }
  | { readonly _tag: 'Relancer'; readonly palier: PalierDeRelance }
  | {
      readonly _tag: 'Avertir'
      readonly suppressionLe: Date
      readonly joursRestants: number
    }
  | { readonly _tag: 'Effacer' }
  | { readonly _tag: 'Reinitialiser' }

export type SituationDeRelance = {
  readonly phase: PhaseDeRelance
  readonly depuis: Date
  readonly relance: Relance
  readonly suppressionAnnoncee: Date | null
  readonly aProduit: boolean
}

const UN_JOUR = 24 * 60 * 60 * 1000
const AVERTISSEMENT = 90
const EFFACEMENT = 105
const PREAVIS = 14

type Regle = {
  readonly action: (
    situation: SituationDeRelance,
    maintenant: Date,
  ) => ActionDeRelance
  readonly apresJours: number
  readonly relancesAttendues: readonly Relance[]
}

const avertir = (
  { depuis }: SituationDeRelance,
  maintenant: Date,
): ActionDeRelance => {
  const echeance = Math.max(
    depuis.getTime() + EFFACEMENT * UN_JOUR,
    maintenant.getTime() + PREAVIS * UN_JOUR,
  )

  return {
    _tag: 'Avertir',
    suppressionLe: new Date(echeance),
    joursRestants: Math.ceil((echeance - maintenant.getTime()) / UN_JOUR),
  }
}

const relancer = (palier: PalierDeRelance) => (): ActionDeRelance => ({
  _tag: 'Relancer',
  palier,
})

const effacerALEcheance = (
  situation: SituationDeRelance,
  maintenant: Date,
): ActionDeRelance => {
  if (situation.suppressionAnnoncee === null)
    return avertir(situation, maintenant)
  return maintenant.getTime() >= situation.suppressionAnnoncee.getTime()
    ? { _tag: 'Effacer' }
    : { _tag: 'Rien' }
}

const R = (valeur: (typeof relances)[number]): Relance => Relance(valeur)

const reglesParPhase: Record<PhaseDeRelance, readonly Regle[]> = {
  Inscription: [
    {
      action: effacerALEcheance,
      apresJours: EFFACEMENT,
      relancesAttendues: [R('AvertissementJ90')],
    },
    {
      action: avertir,
      apresJours: AVERTISSEMENT,
      relancesAttendues: [R('Aucune'), R('J60')],
    },
    { action: relancer(60), apresJours: 60, relancesAttendues: [R('J30')] },
    { action: relancer(30), apresJours: 30, relancesAttendues: [R('J7')] },
    { action: relancer(7), apresJours: 7, relancesAttendues: [R('Aucune')] },
  ],
  Nouveau: [
    {
      action: effacerALEcheance,
      apresJours: EFFACEMENT,
      relancesAttendues: [R('AvertissementJ90')],
    },
    {
      action: avertir,
      apresJours: AVERTISSEMENT,
      relancesAttendues: [R('Aucune'), R('J60')],
    },
    {
      action: relancer(60),
      apresJours: 60,
      relancesAttendues: [R('Aucune'), R('J30')],
    },
    {
      action: relancer(30),
      apresJours: 30,
      relancesAttendues: [R('Aucune'), R('J7')],
    },
    { action: relancer(7), apresJours: 7, relancesAttendues: [R('Aucune')] },
  ],
}

const DELAI_DE_REINITIALISATION = 7

export const actionDeRelance = (
  situation: SituationDeRelance,
  maintenant: Date,
): ActionDeRelance => {
  if (situation.aProduit) return { _tag: 'Rien' }

  const jours = (maintenant.getTime() - situation.depuis.getTime()) / UN_JOUR

  const regle = reglesParPhase[situation.phase].find(
    ({ apresJours, relancesAttendues }) =>
      jours > apresJours && relancesAttendues.includes(situation.relance),
  )

  if (regle !== undefined) return regle.action(situation, maintenant)

  return jours <= DELAI_DE_REINITIALISATION && situation.relance !== 'Aucune'
    ? { _tag: 'Reinitialiser' }
    : { _tag: 'Rien' }
}

export const relanceApres = (action: ActionDeRelance): Relance | null => {
  if (action._tag === 'Relancer')
    return Relance(
      action.palier === 7 ? 'J7' : action.palier === 30 ? 'J30' : 'J60',
    )
  if (action._tag === 'Avertir') return Relance('AvertissementJ90')
  if (action._tag === 'Reinitialiser') return Relance('Aucune')
  return null
}

export const suppressionAnnonceeApres = (
  action: ActionDeRelance,
): Date | null => (action._tag === 'Avertir' ? action.suppressionLe : null)
