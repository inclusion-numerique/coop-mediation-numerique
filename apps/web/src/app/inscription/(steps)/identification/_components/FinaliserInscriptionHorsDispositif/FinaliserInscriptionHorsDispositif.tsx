import React from 'react'
import type { ProfileInscriptionSlug } from '@app/web/inscription/profilInscription'
import { AnotherRoleFound } from '../AnotherRoleFound'
import { RoleFound } from '../RoleFound'

export const FinaliserInscriptionHorsDispositif = ({
  checkedProfilInscription,
  intendedProfilInscription,
  lieuActiviteCount,
}: {
  checkedProfilInscription: ProfileInscriptionSlug
  intendedProfilInscription: ProfileInscriptionSlug
  lieuActiviteCount: number
}) =>
  checkedProfilInscription === 'mediateur' ? (
    <RoleFound role={intendedProfilInscription}>
      <div>
        <p>
          La Coop de la médiation numérique s’adresse aux médiateurs numériques
          professionnels.
        </p>
        <p className="fr-mb-0">
          Afin de finaliser votre inscription, nous allons vous demander de{' '}
          <strong>
            renseigner votre structure employeuse ainsi que vos lieux
            d’activités.
          </strong>
        </p>
      </div>
    </RoleFound>
  ) : (
    <AnotherRoleFound
      roleFound={checkedProfilInscription}
      lieuActiviteCount={lieuActiviteCount}
    />
  )
