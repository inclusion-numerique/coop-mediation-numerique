export const isEmailMatch = (email1: string, email2: string): boolean =>
  email1.toLowerCase() === email2.toLowerCase()

export const isAlreadyInvited = (
  email: string,
  existingInvitations: { email: string }[],
): boolean =>
  existingInvitations.some((invitation) =>
    isEmailMatch(invitation.email, email),
  )

export const isAlreadyTeamMember = (
  email: string,
  teamMembers: { mediateur: { user: { email: string } } }[],
): boolean =>
  teamMembers.some(({ mediateur }) => isEmailMatch(mediateur.user.email, email))

export const normalizeEmail = (email: string): string => email.toLowerCase()
