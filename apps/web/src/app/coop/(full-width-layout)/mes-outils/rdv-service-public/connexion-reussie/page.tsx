import RdvServicePubliqueConnexionCard from '@app/web/app/coop/(full-width-layout)/mes-outils/rdv-service-public/RdvServicePubliqueConnexionCard'
import IconInSquare from '@app/web/components/IconInSquare'
import {
  rdvIntegrationEnSavoirPlusLink,
  rdvMyHomepageLink,
} from '@app/web/rdv-service-public/rdvServicePublicOauth'
import Button from '@codegouvfr/react-dsfr/Button'
import Link from 'next/link'
import React from 'react'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import { notFound } from 'next/navigation'
import { rdvAccountMetadata } from '@app/web/rdv-service-public/rdvAccountMetadata'

const RdvServicePublicCreationReussiePage = async () => {
  const user = await getSessionUser()
  if (!user) {
    notFound()
  }

  const { hasOrganisations } = rdvAccountMetadata(user)

  return (
    <div className="fr-mb-32v fr-mt-10v">
      <RdvServicePubliqueConnexionCard
        header={false}
        title="Créer son compte avec ProConnect"
      >
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

          {hasOrganisations ? (
            <p className="fr-text-mention--grey fr-mb-6v">
              Vous pouvez maintenant programmer des rendez-vous avec vos
              bénéficiaires suivis et les retrouver dans leur historiques
              d’accompagnements.
            </p>
          ) : (
            <p className="fr-text-mention--grey fr-mb-6v">
              Pour pouvoir programmer des rendez-vous avec vos bénéficiaires
              suivis et les retrouver dans leur historiques d’accompagnements,
              vous devez terminer la configuration de votre nouveau compte sur
              le site RDV Service Public.
              <br />
              <br />
              <Button
                priority="tertiary"
                linkProps={{
                  target: '_blank',
                  href: rdvMyHomepageLink,
                }}
              >
                Terminer la configuration de mon nouveau compte
                RDV&nbsp;Service&nbsp;Public
              </Button>
            </p>
          )}
          <Link
            href={rdvIntegrationEnSavoirPlusLink}
            className="fr-link fr-text--center"
            target="_blank"
          >
            En savoir plus (centre d’aide de la Coop)
          </Link>
        </div>
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
      </RdvServicePubliqueConnexionCard>
    </div>
  )
}

export default RdvServicePublicCreationReussiePage
