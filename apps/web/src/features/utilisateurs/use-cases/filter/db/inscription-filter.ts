import type { OnboardingStatus, Prisma } from '@prisma/client'

export const inscriptionFilter = (
  created: { lt?: Date; gte?: Date },
  previousOnboardingStatus: (OnboardingStatus | null)[] = [],
): Prisma.UserWhereInput => ({
  inscriptionValidee: null,
  role: { not: 'Admin' },
  deleted: null,
  created,
  ...(previousOnboardingStatus.length > 0
    ? {
        OR: previousOnboardingStatus.map((status) => ({
          onboardingStatus: status,
        })),
      }
    : {}),
})
