/**
 * Install webhooks for a given RDV account
 * Organisations should already have been synced before calling this function
 */
export const installWebhooks = async ({
  rdvAccount,
}: {
  rdvAccount: RdvAccount
}) => {
  const webhooks = await oAuthRdvApiListWebhooks({ rdvAccount })
}
