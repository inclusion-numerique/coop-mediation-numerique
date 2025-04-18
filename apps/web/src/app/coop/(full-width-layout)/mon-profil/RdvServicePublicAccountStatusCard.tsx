'use client'

import { SessionUser } from '@app/web/auth/sessionUser'
import { withTrpc } from '@app/web/components/trpc/withTrpc'
import { useRdvOauthStatus } from '@app/web/hooks/useRdvOauthStatus'
import CreateOrUpdateRdvServicepublicAccountButton from '@app/web/rdv-service-public/CreateOrUpdateRdvServicePublicAccountButton'
import { rdvOauthLinkAccountFlowUrl } from '@app/web/rdv-service-public/rdvServicePublicOauth'
import { Spinner } from '@app/web/ui/Spinner'
import Button from '@codegouvfr/react-dsfr/Button'
import Notice from '@codegouvfr/react-dsfr/Notice'
import classNames from 'classnames'
import React from 'react'

const statusIcons = {
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

const RdvServicePublicAccountStatusCard = ({
  user,
  oAuthFlowRedirectTo,
}: {
  user: Pick<SessionUser, 'id' | 'rdvAccount'>
  oAuthFlowRedirectTo: string
}) => {
  const { rdvAccount } = user

  const oauthStatus = useRdvOauthStatus({ user })

  const hasOauthTokens = rdvAccount?.hasOauthTokens ?? false

  const step1Status = rdvAccount ? 'success' : 'todo'
  const step2Status = rdvAccount?.hasOauthTokens
    ? 'success'
    : rdvAccount
      ? 'todo'
      : 'warning'

  return (
    <>
      <h2 className="fr-h4 fr-text-title--blue-france fr-mt-6v">
        Accéder aux fonctionnalités de RDV Aide Numérique
      </h2>

      <h3 className="fr-h6 fr-mt-6v">
        {statusIcons[step1Status]}
        Étape 1&nbsp;: je créé mon compte RDV Aide Numérique
      </h3>

      {rdvAccount ? (
        <div className="fr-flex-grow-1 fr-flex-basis-0  fr-border fr-border-radius--8 fr-p-6v">
          <p className="fr-text--bold">
            Votre compte RDV Aide Numérique a bien été créé
          </p>
          <p>
            Si besoin, vous pouvez mettre à jour vos lieux d’activités sur RDV
            Service Public en cliquant sur le bouton ci-dessous&nbsp;:
          </p>
          <CreateOrUpdateRdvServicepublicAccountButton
            user={user}
            variant="synchronisation"
          />
        </div>
      ) : (
        <div className="fr-flex fr-flex-gap-4v">
          <div className="fr-flex fr-flex-gap-4v">
            <div className="fr-flex-grow-1 fr-flex-basis-0 fr-border fr-border-radius--8 fr-p-6v">
              <p className="fr-text--bold">
                Je n’ai pas encore de compte RDV Aide Numérique
              </p>
              <p>
                La Coop de la médiation numérique vous permet de créer votre
                compte RDV Aide Numérique.
                <br />
                En cliquant sur le bouton ci-dessous, vous recevrez un email
                d’invitation à créer votre compte sur RDV Aide Numérique.
                <br />
                Une fois votre compte créé, revenez sur cette page pour
                connecter votre compte RDV Aide Numérique à la Coop de la
                médiation numérique.
              </p>
              <CreateOrUpdateRdvServicepublicAccountButton
                user={user}
                variant="creation"
              />
            </div>
            <div className="fr-flex-grow-1 fr-flex-basis-0  fr-border fr-border-radius--8 fr-p-6v">
              <p className="fr-text--bold">
                J’ai déjà un compte RDV Aide Numérique
              </p>
              <p>
                Cliquez sur le bouton ci-dessous pour que nous puissions
                synchroniser votre compte RDV Aide Numérique.
                <br />
                Vous pourrez ensuite connecter RDV Aide Numérique à la Coop de
                la médiation numérique.
              </p>
              <CreateOrUpdateRdvServicepublicAccountButton
                user={user}
                variant="synchronisation"
              />
            </div>
          </div>
        </div>
      )}
      <h3 className="fr-h6 fr-mt-6v">
        {statusIcons[step2Status]}
        Étape 2&nbsp;: Je connecte la Coop à RDV Aide Numérique
      </h3>
      <div className="fr-border fr-border-radius--8 fr-p-6v">
        {rdvAccount ? (
          <>
            <p>
              Connectez votre compte RDV Aide Numérique à la Coop afin de
              pouvoir vous connecter à vos rendez-vous et d’utiliser les
              fonctionnalités d’intégration avec RDV Aide Numérique que nous
              sommes en train de développer.
            </p>
            <div
              className={classNames(
                'fr-flex fr-direction-column fr-align-items-center fr-width-full',
              )}
            >
              {oauthStatus.isLoading && (
                <div className="fr-width-full fr-my-4v fr-flex fr-align-items-center fr-justify-content-center">
                  <Spinner />
                </div>
              )}
              {(!hasOauthTokens || oauthStatus.isError) && (
                <Button
                  linkProps={{
                    href: rdvOauthLinkAccountFlowUrl({
                      redirectTo: oAuthFlowRedirectTo,
                    }),
                  }}
                  iconId="fr-icon-lock-line"
                >
                  Autoriser la Coop à communiquer avec votre compte RDV Service
                  Public
                </Button>
              )}
              {oauthStatus.isSuccess && (
                <>
                  <Notice
                    title="Votre compte RDV Aide Numérique est connecté"
                    className="fr-mt-4v fr-notice--success"
                  />
                  <Button
                    className="fr-mt-4v"
                    priority="tertiary"
                    iconId="fr-icon-lock-line"
                    linkProps={{
                      href: rdvOauthLinkAccountFlowUrl({
                        redirectTo: oAuthFlowRedirectTo,
                      }),
                    }}
                  >
                    Reconnecter votre compte RDV Aide Numérique
                  </Button>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <p>
              Une fois votre compte RDV Aide Numérique configuré et activé, vous
              pourrez lier votre compte à la coop.
            </p>
            <div
              className={classNames(
                'fr-flex fr-direction-column fr-align-items-center fr-width-full',
              )}
            >
              <Notice
                title="Vous devez avoir créé et synchronisé votre compte RDV Aide Numérique à l'étape 1 avant de pouvoir autoriser la Coop à communiquer avec votre compte RDV Aide Numérique."
                className="fr-mt-4v fr-notice--warning"
              />
            </div>
            <div
              className={classNames(
                'fr-flex fr-direction-column fr-align-items-center fr-width-full',
              )}
            >
              {!rdvAccount && (
                <Notice
                  title="Vous devez avoir créé et synchronisé votre compte RDV Aide Numérique à l'étape 1 avant de pouvoir autoriser la Coop à communiquer avec votre compte RDV Aide Numérique."
                  className="fr-mt-4v fr-notice--warning"
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default withTrpc(RdvServicePublicAccountStatusCard)
