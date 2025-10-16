import { prismaClient } from '@app/web/prismaClient'
import { userPrismaDataFromOAuthApiUser } from '../sync/syncRdv'
import type { RdvspWebhookEvent, RdvspWebhookUserData } from './rdvWebhook'

/**
 * Converts webhook user data to the format expected by userPrismaDataFromOAuthApiUser
 */
const webhookUserToOAuthApiUser = (
  data: RdvspWebhookUserData,
): Parameters<typeof userPrismaDataFromOAuthApiUser>[0] => {
  return {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    notification_email: data.notification_email,
    notify_by_email: data.notify_by_email,
    notify_by_sms: data.notify_by_sms,
    phone_number: data.phone_number,
    phone_number_formatted: data.phone_number_formatted,
    address: data.address,
    address_details: data.address_details,
    affiliation_number: data.affiliation_number,
    birth_date: data.birth_date,
    birth_name: data.birth_name,
    caisse_affiliation: null, // Not available in webhook data
    created_at: data.created_at,
    invitation_accepted_at: data.invitation_accepted_at,
    invitation_created_at: data.invitation_created_at,
    responsible_id: data.responsible_id,
    responsible: null, // Not needed for upsert
    user_profiles: null, // Not needed for upsert
  }
}

export const handleUserModelWebhook = async ({
  data,
  event,
}: {
  data: RdvspWebhookUserData
  event: RdvspWebhookEvent
}) => {
  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`[rdvsp webhook] Processing User ${event} for User id ${data.id}`)

  try {
    switch (event) {
      case 'created': {
        /**
         * We skip creating new RdvUser records from webhooks because:
         * - We can't determine which mediateur(s) should have access to this user
         * - RdvUsers are created during RDV sync when we have the full context
         * - A user without any RDV appointments is not relevant to our system yet
         */
        // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
        console.log(
          `[rdvsp webhook] Skipping User creation for id ${data.id} (users are created during RDV sync)`,
        )
        break
      }

      case 'updated': {
        // Only update if this RdvUser is already linked to at least one Beneficiaire
        const linkedBeneficiaire = await prismaClient.beneficiaire.findFirst({
          where: { rdvUserId: data.id },
          select: { id: true },
        })

        if (linkedBeneficiaire) {
          // Update the RdvUser with the latest data
          const userData = userPrismaDataFromOAuthApiUser(
            webhookUserToOAuthApiUser(data),
          )
          await prismaClient.rdvUser.update({
            where: { id: data.id },
            data: userData,
          })
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(`[rdvsp webhook] Updated RdvUser ${data.id}`)
        } else {
          // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
          console.log(
            `[rdvsp webhook] Skipping User update for id ${data.id} (not linked to any beneficiaire)`,
          )
        }
        break
      }

      case 'destroyed': {
        // Unlink all beneficiaires from this RdvUser
        await prismaClient.beneficiaire.updateMany({
          where: { rdvUserId: data.id },
          data: { rdvUserId: null },
        })

        // Delete the RdvUser (cascade will delete RdvUserProfile)
        await prismaClient.rdvUser.delete({
          where: { id: data.id },
        })
        // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
        console.log(
          `[rdvsp webhook] Deleted RdvUser ${data.id} and unlinked beneficiaires`,
        )
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
      `[rdvsp webhook] Error processing User ${event} for User id ${data.id}:`,
      error,
    )
    throw error
  }
}
