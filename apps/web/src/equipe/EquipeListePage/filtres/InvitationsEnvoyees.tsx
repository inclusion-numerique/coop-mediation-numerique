'use client'

import { FiltreBouton } from './FiltreBouton'

export const InvitationsEnvoyees = ({ count }: { count: number }) => (
  <FiltreBouton filterParam="invitations" count={count}>
    Invitations envoyées
  </FiltreBouton>
)
