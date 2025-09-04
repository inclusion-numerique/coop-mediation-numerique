import RoleInscriptionNotice from '@app/web/app/inscription/RoleInscriptionNotice'
import type { SessionUser } from '@app/web/auth/sessionUser'
import {
  allProfileInscriptionLabels,
  ProfileInscriptionSlug,
  profileInscriptionFromSlug,
} from '@app/web/features/utilisateurs/use-cases/registration/profilInscription'
import React from 'react'
import { AnotherRoleFound } from '../AnotherRoleFound'
import { RoleFound } from '../RoleFound'
import { RoleNotFound } from '../RoleNotFound'

export const FinaliserInscriptionCoordinateurConseillerNumerique = ({
  checkedProfilInscription,
  lieuActiviteCount,
  user,
  proConnectIdTokenHint,
}: {
  checkedProfilInscription: ProfileInscriptionSlug
  lieuActiviteCount: number
  user: Pick<SessionUser, 'email' | 'id'>
  proConnectIdTokenHint: string | null
}) => {
  switch (checkedProfilInscription) {
    case 'conseiller-numerique': {
      return (
        <AnotherRoleFound
          roleFound={checkedProfilInscription}
          lieuActiviteCount={lieuActiviteCount}
        />
      )
    }
    case 'mediateur': {
      return (
        <RoleNotFound
          roleNotFound="coordinateur"
          user={user}
          proConnectIdTokenHint={proConnectIdTokenHint}
        />
      )
    }
    default: {
      return (
        <RoleFound
          role={checkedProfilInscription}
          lieuActiviteCount={lieuActiviteCount}
        >
          <RoleInscriptionNotice
            roleInscription={allProfileInscriptionLabels[
              profileInscriptionFromSlug[checkedProfilInscription]
            ].toLocaleLowerCase()}
          />
        </RoleFound>
      )
    }
  }
}
