import type { OnboardingStatus, Prisma } from '@prisma/client'

const noPendingInvitations = { none: { acceptee: null, refusee: null } }

const noActivityFilter: Prisma.UserWhereInput[] = [
  {
    mediateur: { is: null },
    coordinateur: {
      is: {
        derniereCreationActivite: null,
        mediateursCoordonnes: { none: { suppression: null } },
        invitations: noPendingInvitations,
      },
    },
  },
  {
    coordinateur: { is: null },
    mediateur: { is: { derniereCreationActivite: null } },
  },
  {
    mediateur: { is: { derniereCreationActivite: null } },
    coordinateur: {
      is: {
        derniereCreationActivite: null,
        mediateursCoordonnes: { none: { suppression: null } },
        invitations: noPendingInvitations,
      },
    },
  },
]

export const nouveauFilter = (
  inscriptionValidee: { lt?: Date; gte?: Date },
  previousOnboardingStatus: (OnboardingStatus | null)[] = [],
): Prisma.UserWhereInput => ({
  inscriptionValidee,
  role: { not: 'Admin' },
  deleted: null,
  ...(previousOnboardingStatus.length > 0
    ? {
        OR: previousOnboardingStatus.map((status) => ({
          onboardingStatus: status,
        })),
        AND: [{ OR: noActivityFilter }],
      }
    : { OR: noActivityFilter }),
})
