import { getSessionUser } from '@app/web/auth/getSessionUser'
import { RDVServicePublicCoopConnexion } from '@app/web/features/pictograms/services/RDVServicePublicCoopConnexion'
import {
  rdvOauthLinkAccountErrorCallbackPath,
  rdvOauthLinkAccountFlowUrl,
  rdvOauthLinkAccountSuccessCallbackPath,
} from '@app/web/features/rdvsp/oauth'
import GererRdvServicePublicButton from '@app/web/features/rdvsp/ui/GererRdvServicePublicButton'
import {
  rdvIntegrationEnSavoirPlusLink,
  rdvMyHomepageLink,
} from '@app/web/features/rdvsp/urls'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import React from 'react'
import GererRdvServicePublicModal from './GererRdvServicePublicModal'
import RdvServicePublicStatusTag from './RdvServicePublicStatusTag'

const RdvServicePublicAccess = async () => {
  const user = await getSessionUser()

  if (!user) {
    return null
  }

  const status = user.rdvAccount?.statut ?? 'jamaisConnecte'

  return (
    <>
      <RDVServicePublicCoopConnexion
        className="fr-flex fr-width-full fr-align-items-center fr-justify-content-center"
        aria-hidden
      />
      <div className="fr-text--center">
        <p className="fr-text--bold fr-mt-8v fr-mb-2v">
          Connectez RDV Service Public à La Coop de la médiation numérique
        </p>
      </div>
      {status === 'jamaisConnecte' && (
        <>
          <div className="fr-text--center">
            <p className="fr-text--sm fr-mb-2v">
              Programmez des rendez-vous avec vos bénéficiaires suivis et
              retrouvez-les dans leurs historiques d’accompagnements.
            </p>
            <Link
              href={rdvIntegrationEnSavoirPlusLink}
              target="_blank"
              className="fr-link"
              rel="noreferrer"
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
              className="fr-mb-0 fr-flex-gap-2v"
            >
              Connecter à La Coop{' '}
              <span className="ri-exchange-line" aria-hidden />
            </Button>
          </div>
        </>
      )}
      {status === 'connecte' && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <RdvServicePublicStatusTag status={status} />
          </div>
          <div className="fr-btns-group fr-btns-group--icon-left fr-mt-8v">
            <Button
              linkProps={{
                href: rdvMyHomepageLink,
                target: '_blank',
              }}
              priority="primary"
            >
              Accéder à l’outil
            </Button>
            <GererRdvServicePublicButton />
          </div>
          <GererRdvServicePublicModal user={user} />
        </>
      )}
      {(status === 'deconnecte' || status === 'enPanne') && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <RdvServicePublicStatusTag status={status} />
          </div>
          <div className="fr-btns-group fr-btns-group--icon-right fr-mt-8v">
            <Button
              linkProps={{
                href: rdvOauthLinkAccountFlowUrl({
                  redirectToSuccess: rdvOauthLinkAccountSuccessCallbackPath,
                  redirectToError: rdvOauthLinkAccountErrorCallbackPath,
                }),
              }}
              priority="primary"
              className="fr-mb-0"
            >
              Reconnecter les outils
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default RdvServicePublicAccess
