import { getSessionUser } from '@app/web/auth/getSessionUser'
import GererRdvServicePublicButton from '@app/web/rdv-service-public/GererRdvServicePublicButton'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import {
  rdvIntegrationEnSavoirPlusLink,
  rdvMyHomepageLink,
  rdvOauthLinkAccountErrorCallbackPath,
  rdvOauthLinkAccountFlowUrl,
  rdvOauthLinkAccountSuccessCallbackPath,
} from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { hasFeatureFlag } from '@app/web/security/hasFeatureFlag'
import Button from '@codegouvfr/react-dsfr/Button'
import Tag from '@codegouvfr/react-dsfr/Tag'
import Link from 'next/link'
import React from 'react'
import GererRdvServicePublicModal from './GererRdvServicePublicModal'

const RdvServicePublicAccess = async () => {
  const user = await getSessionUser()

  if (!user) {
    return null
  }

  const status = getRdvOauthIntegrationStatus({ user })

  const hasFeature = hasFeatureFlag(user, 'RdvServicePublic')

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
      </div>
      {status === 'none' && (
        <>
          <div className="fr-text--center">
            <p className="fr-text--sm fr-mb-2v">
              Programmez des rendez-vous avec vos bénéficiaires suivis et
              retrouvez-les dans leur historiques d’accompagnements.
            </p>
            <Link
              href={rdvIntegrationEnSavoirPlusLink}
              target="_blank"
              className="fr-link"
            >
              En savoir plus
            </Link>
          </div>
          <div className="fr-btns-group fr-btns-group--icon-right fr-mt-8v">
            {hasFeature ? (
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
            ) : (
              <Button
                disabled
                type="button"
                priority="secondary"
                className="fr-mb-0"
              >
                Disponible prochainement
              </Button>
            )}
          </div>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <Tag
              iconId="fr-icon-check-line"
              className="fr-background-contrast--success fr-text-default--success"
            >
              Compte connecté
            </Tag>
          </div>
          <div className="fr-btns-group fr-btns-group--icon-left fr-mt-8v">
            <Button
              linkProps={{
                href: rdvMyHomepageLink,
                target: '_blank',
              }}
              priority="primary"
            >
              Accédez à l’outil
            </Button>
            <GererRdvServicePublicButton />
          </div>
          <GererRdvServicePublicModal user={user} />
        </>
      )}
      {status === 'error' && (
        <>
          <div className="fr-text--center fr-mt-4v">
            <p className="fr-text-mention--grey fr-mb-2v">
              Statut de la connexion
            </p>
            <Tag
              iconId="fr-icon-error-fill"
              className="fr-background-contrast--error fr-text-default--error"
            >
              Compte déconnecté
            </Tag>
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
