import type { OnboardingStatus } from '@app/web/generated/prisma/client'
import { type PhaseDeRelance, Relance, type relances } from '../domain'

const lectureParPhase: Record<
  PhaseDeRelance,
  Partial<Record<OnboardingStatus, Relance>>
> = {
  Inscription: {
    reminder_j7_sent: Relance('J7'),
    reminder_j30_sent: Relance('J30'),
    reminder_j60_sent: Relance('J60'),
    warning_j90_sent: Relance('AvertissementJ90'),
  },
  Nouveau: {
    nouveau_j7_sent: Relance('J7'),
    nouveau_j30_sent: Relance('J30'),
    nouveau_j60_sent: Relance('J60'),
    warning_j90_sent: Relance('AvertissementJ90'),
  },
}

const ecritureParPhase: Record<
  PhaseDeRelance,
  Record<(typeof relances)[number], OnboardingStatus | null>
> = {
  Inscription: {
    Aucune: null,
    J7: 'reminder_j7_sent',
    J30: 'reminder_j30_sent',
    J60: 'reminder_j60_sent',
    AvertissementJ90: 'warning_j90_sent',
  },
  Nouveau: {
    Aucune: null,
    J7: 'nouveau_j7_sent',
    J30: 'nouveau_j30_sent',
    J60: 'nouveau_j60_sent',
    AvertissementJ90: 'warning_j90_sent',
  },
}

export const relanceToDomain = (
  phase: PhaseDeRelance,
  statut: OnboardingStatus | null,
): Relance =>
  (statut === null ? undefined : lectureParPhase[phase][statut]) ??
  Relance('Aucune')

const statutDe = (
  phase: PhaseDeRelance,
  relance: (typeof relances)[number],
): OnboardingStatus | null => ecritureParPhase[phase][relance]

export const relanceFromDomain = (
  phase: PhaseDeRelance,
  relance: Relance,
): OnboardingStatus | null => statutDe(phase, relance)
