import { SessionUser } from '@app/web/auth/sessionUser'

export const rdvAccountMetadata = ({
  rdvAccount,
}: {
  rdvAccount: SessionUser['rdvAccount']
}) => {
  if (!rdvAccount) {
    return {
      hasAccount: false,
      hasOrganisations: false,
      organisations: 0,
    }
  }

  return {
    hasAccount: true,
    hasOrganisations: rdvAccount.organisations.length > 0,
    organisations: rdvAccount.organisations.length,
  }
}
