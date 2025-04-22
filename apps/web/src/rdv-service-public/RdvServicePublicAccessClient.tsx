'use client'

import { SessionUser } from '@app/web/auth/sessionUser'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import React from 'react'

const _statusIcons = {
  success: (
    <span className="fr-icon-checkbox-line fr-mr-1w fr-text-default--success" />
  ),
  todo: (
    <span className="fr-icon-arrow-right-line fr-mr-1w fr-text-title--blue-france" />
  ),
  warning: (
    <span className="fr-icon-warning-fill fr-mr-1w fr-text-default--warning" />
  ),
}

const RdvServicePublicAccessClient = async ({
  user,
}: {
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
}) => {
  // const _oauthStatus = useRdvOauthStatus({ user })

  const { rdvAccount } = user

  const _hasOauthTokens = rdvAccount?.hasOauthTokens ?? false

  return (
    <>
      <div className="fr-flex fr-width-full fr-align-items-center fr-justify-content-center">
        <img
          src="/images/services/rdv-service-public-coop-connexion.svg"
          alt=""
        />
      </div>
      <div className="fr-text--center">
        <p className="fr-text--bold fr-mt-8v fr-mb-2v">
          Connectez RDV Service Public à La Coop de la médiation numérique
        </p>
        <p className="fr-text--sm fr-mb-2v">
          Programmez des rendez-vous avec vos bénéficiaires suivis et
          retrouvez-les dans leur historiques d’accompagnements.
        </p>
        <Link
          href="https://rdv.anct.gouv.fr"
          target="_blank"
          className="fr-link"
        >
          En savoir plus
        </Link>
      </div>
      <div className="fr-btns-group fr-btns-group--icon-right fr-mt-8v">
        <Button
          linkProps={{
            href: '/coop/mes-outils/rdv-service-public/se-connecter',
          }}
          priority="primary"
          iconId="fr-icon-link"
          className="fr-mb-0"
        >
          Connecter à La Coop
        </Button>
      </div>
    </>
  )
}

export default withTrpc(RdvServicePublicAccessClient)
