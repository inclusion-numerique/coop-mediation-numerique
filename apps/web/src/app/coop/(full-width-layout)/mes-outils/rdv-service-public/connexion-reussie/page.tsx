import RdvServicePubliqueConnexionCard from '@app/web/app/coop/(full-width-layout)/mes-outils/rdv-service-public/RdvServicePubliqueConnexionCard'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import IconInSquare from '@app/web/components/IconInSquare'
import {
  rdvIntegrationEnSavoirPlusLink,
  rdvMyHomepageLink,
  rdvServicePublicGettingStartedLink,
} from '@app/web/rdv-service-public/rdvServicePublicOauth'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

const RdvServicePublicCreationReussiePage = async () => {
  const user = await getSessionUser()
  if (!user) {
    notFound()
  }

  const hasSetupRdvspAccount = (user.rdvAccount?.organisations.length ?? 0) > 0

  return (
    <div className="fr-mb-32v fr-mt-10v">
      <RdvServicePubliqueConnexionCard header={false} title="">
        <div className="fr-grid-row fr-grid-row--center">
          <IconInSquare
            iconId="fr-icon-checkbox-circle-fill"
            size="medium"
            className="fr-background-contrast--success"
            classes={{
              icon: 'fr-text-default--success',
            }}
          />
        </div>
        <div className="fr-text--center">
          <h1 className="fr-mt-6v fr-h2 fr-text-title--blue-france fr-mb-4v">
            Connexion réussie&nbsp;!
          </h1>

          <p className="fr-text-mention--grey fr-mb-0">
            Vous pouvez maintenant programmer des rendez-vous avec vos
            bénéficiaires suivis et les retrouver dans leur historiques
            d’accompagnements.
          </p>

          <Link
            href={rdvIntegrationEnSavoirPlusLink}
            className="fr-link fr-text--center"
            target="_blank"
          >
            En savoir plus
          </Link>
        </div>

        {hasSetupRdvspAccount ? (
          <div className="fr-btns-group fr-mt-8v">
            <Button
              linkProps={{
                href: '/coop/mes-outils/rdv-service-public',
              }}
              className="fr-mb-0"
            >
              J’ai compris
            </Button>
          </div>
        ) : (
          <>
            <div className="fr-background-alt--blue-france fr-border-radius--8 fr-flex fr-align-items-center fr-flex-gap-6v fr-p-6v fr-mt-10v">
              <div className="fr-background-default--grey fr-p-1v fr-border-radius--8 fr-flex">
                <img
                  className="fr-display-block"
                  alt=""
                  src="/images/services/rdv-service-public.svg"
                  style={{ width: 32, height: 32 }}
                />
              </div>
              <div>
                <p className="fr-text--sm fr-mb-2v">
                  Consultez la rubrique{' '}
                  <strong>Démarrer sur RDV Service Public</strong> afin d’être
                  guidé dans la prise en main de l’outil.
                </p>
                <Link
                  href={rdvServicePublicGettingStartedLink}
                  className="fr-link fr-link--sm fr-mb-0"
                  target="_blank"
                >
                  Démarrer sur RDV Service Public
                </Link>
              </div>
            </div>
            <p className="fr-text--xl fr-mb-6v fr-mt-10v fr-text--center">
              Finalisez la configuration de votre compte
              RDV&nbsp;Service&nbsp;Public&nbsp;:
            </p>
            <div className="fr-btns-group fr-my-0">
              <Button
                linkProps={{
                  href: rdvMyHomepageLink,
                  target: '_blank',
                }}
                className="fr-mb-0"
              >
                Accéder à RDV&nbsp;Service&nbsp;Public
              </Button>
              <div className="fr-width-full fr-text--center fr-mt-4v ">
                <Link
                  href="/coop/mes-outils/rdv-service-public"
                  className="fr-link fr-mb-0"
                >
                  Configurer plus tard
                </Link>
              </div>
            </div>
          </>
        )}
      </RdvServicePubliqueConnexionCard>
    </div>
  )
}

export default RdvServicePublicCreationReussiePage
