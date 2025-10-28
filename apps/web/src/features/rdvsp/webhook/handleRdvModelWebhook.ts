import { prismaClient } from '@app/web/prismaClient'
import type { OAuthApiRdv } from '@app/web/rdv-service-public/OAuthRdvApiCallInput'
import {
  createOrMergeBeneficiairesFromRdvUserIds,
  createOrMergeBeneficiairesFromRdvUsers,
} from '../sync/createOrMergeBeneficiaireFromRdvUsers'
import {
  createRdv,
  deleteRdv,
  syncRdvDependencies,
  updateRdv,
} from '../sync/syncRdv'
import type { RdvspWebhookEvent, RdvspWebhookRdvData } from './rdvWebhook'

// Convert webhook RDV data to OAuthApiRdv format
const webhookRdvToOAuthApiRdv = (data: RdvspWebhookRdvData): OAuthApiRdv => {
  // Note: motif_category in webhook is a string, but we need the full object for OAuthApiRdv
  // The sync functions handle this by using motif_category?.id which works with null
  return {
    ...data,
    motif: {
      ...data.motif,
      // For now, we use null as we only have the string ID from webhook
      // The syncRdvMotif function handles this correctly
      motif_category: null,
    },
  } as unknown as OAuthApiRdv
}

export const handleRdvModelWebhook = async ({
  data,
  event,
}: {
  data: RdvspWebhookRdvData
  event: RdvspWebhookEvent
}) => {
  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`[rdvsp webhook] Processing RDV ${event} for RDV id ${data.id}`)

  // Find the RDV account from one of the agents in the RDV
  // The webhook includes agents who are associated with the RDV
  const rdvAccountId = data.agents[0]?.id
  if (!rdvAccountId) {
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error(
      `[rdvsp webhook] No agent found in RDV ${data.id}, cannot determine RDV account`,
    )
    return
  }

  // Check if we have this RDV account in our system
  const rdvAccount = await prismaClient.rdvAccount.findUnique({
    where: { id: rdvAccountId },
    include: {
      user: {
        select: {
          mediateur: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  if (!rdvAccount) {
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.warn(
      `[rdvsp webhook] RDV account ${rdvAccountId} not found in our system, skipping webhook`,
    )
    return
  }

  try {
    const rdv = webhookRdvToOAuthApiRdv(data)

    switch (event) {
      case 'created':
      case 'updated': {
        // Check if RDV exists in our database even if created event (to avoid race condition)
        const existingRdv = await prismaClient.rdv.findUnique({
          where: { id: data.id },
        })
        const { rdvUsers } = await syncRdvDependencies(rdv)
        if (rdvAccount.user?.mediateur?.id) {
          await createOrMergeBeneficiairesFromRdvUserIds({
            rdvUsers,
            mediateurId: rdvAccount.user.mediateur.id,
          })
        }

        if (!existingRdv) {
          // If RDV doesn't exist, treat as create
          await createRdv(rdv, rdvAccountId)
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(
            `[rdvsp webhook] Created RDV ${data.id} (was updated but didn't exist)`,
          )
        } else {
          await updateRdv(rdv, rdvAccountId)
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(`[rdvsp webhook] Updated RDV ${data.id}`)
        }
        break
      }

      case 'destroyed': {
        // Delete the RDV if it exists
        const existingRdv = await prismaClient.rdv.findUnique({
          where: { id: data.id },
        })

        if (existingRdv) {
          await deleteRdv(data.id)
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(`[rdvsp webhook] Deleted RDV ${data.id}`)
        } else {
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(
            `[rdvsp webhook] RDV ${data.id} not found for deletion, skipping`,
          )
        }
        break
      }

      default: {
        const exhaustiveCheck: never = event
        // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
        console.warn(
          `[rdvsp webhook] Unknown event type: ${String(exhaustiveCheck)}`,
        )
      }
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error(
      `[rdvsp webhook] Error processing RDV ${event} for RDV id ${data.id}:`,
      error,
    )
    throw error
  }
}
