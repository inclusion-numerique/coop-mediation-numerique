import { prismaClient } from '@app/web/prismaClient'

export const getAdministrationRdvspUserData = async ({
  userId,
}: {
  userId: string
}) => {
  const user = await prismaClient.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      rdvAccount: {
        select: {
          _count: {
            select: {
              rdvs: true,
            },
          },
          syncLogs: {
            select: {
              id: true,
              started: true,
              ended: true,
              error: true,
              drift: true,
              log: true,
              rdvsCount: true,
              rdvsDrift: true,
              rdvsNoop: true,
              rdvsCreated: true,
              rdvsUpdated: true,
              rdvsDeleted: true,
              organisationsCount: true,
              organisationsDrift: true,
              organisationsNoop: true,
              organisationsCreated: true,
              organisationsUpdated: true,
              organisationsDeleted: true,
              webhooksCount: true,
              webhooksDrift: true,
              webhooksNoop: true,
              webhooksCreated: true,
              webhooksUpdated: true,
              webhooksDeleted: true,
              usersCount: true,
              usersDrift: true,
              usersNoop: true,
              usersCreated: true,
              usersUpdated: true,
              usersDeleted: true,
              motifsCount: true,
              motifsDrift: true,
              motifsNoop: true,
              motifsCreated: true,
              motifsUpdated: true,
              motifsDeleted: true,
              lieuxCount: true,
              lieuxDrift: true,
              lieuxNoop: true,
              lieuxCreated: true,
              lieuxUpdated: true,
              lieuxDeleted: true,
            },
            take: 5,
            orderBy: {
              started: 'desc',
            },
          },
          id: true,
          created: true,
          expiresAt: true,
          accessToken: true,
          refreshToken: true,
          error: true,
          syncFrom: true,
          includeRdvsInActivitesList: true,
          invalidWebhookOrganisationIds: true,
          organisations: {
            select: {
              organisation: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const rdvAccount = user?.rdvAccount

  if (!user || !rdvAccount) {
    return null
  }

  // Valid and invalid webhook organisations
  const validWebhookOrganisations = rdvAccount.organisations.filter(
    (organisation) =>
      !rdvAccount.invalidWebhookOrganisationIds.includes(
        organisation.organisation.id,
      ),
  )
  const invalidWebhookOrganisations = rdvAccount.organisations.filter(
    (organisation) =>
      rdvAccount.invalidWebhookOrganisationIds.includes(
        organisation.organisation.id,
      ),
  )

  const webhookStatus = {
    valid: {
      count: validWebhookOrganisations.length,
      organisations: validWebhookOrganisations,
    },
    invalid: {
      count: invalidWebhookOrganisations.length,
      organisations: invalidWebhookOrganisations,
    },
    status:
      invalidWebhookOrganisations.length > 0
        ? ('error' as const)
        : ('success' as const),
  }

  return {
    user: { ...user, rdvAccount, webhookStatus },
  }
}

export type AdministrationRdvspUserData = NonNullable<
  Awaited<ReturnType<typeof getAdministrationRdvspUserData>>
>
