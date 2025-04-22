import RdvServicePubliqueConnexionCard from '@app/web/app/coop/(full-width-layout)/mes-outils/rdv-service-public/RdvServicePubliqueConnexionCard'
import React from 'react'
import Link from 'next/link'
import Button from '@codegouvfr/react-dsfr/Button'

const RdvServicePublicCreationReussiePage = () => {
  return (
    <div className="fr-mb-32v fr-mt-10v">
      <RdvServicePubliqueConnexionCard
        header={false}
        title="Créer son compte avec ProConnect"
      >
        <div className="fr-grid-row fr-grid-row--center">
          <picture>
            <img
              src="/images/services/rdv-service-public-coop-connexion.svg"
              alt=""
            />
          </picture>
        </div>
        <div className="fr-text--center">
          <h1 className="fr-mt-4v fr-h2 fr-text-title--blue-france fr-mb-4v">
            <span className="fr-icon-success-fill fr-icon--lg fr-text-default--success" />{' '}
            Connexion réussie&nbsp;!
          </h1>
          <p className="fr-mb-4v ">
            Vous pouvez maintenant programmer des rendez-vous avec vos
            bénéficiaires suivis et les retrouver dans leur historiques
            d’accompagnements.
          </p>
          <Link href="TODO" className="fr-link fr-text--center" target="_blank">
            En savoir plus
          </Link>
        </div>
        <div className="fr-btns-group fr-mt-8v">
          <Button
            linkProps={{
              href: '/coop/mes-outils/rdv-service-public',
            }}
          >
            J’ai compris
          </Button>
        </div>
      </RdvServicePubliqueConnexionCard>
    </div>
  )
}

export default RdvServicePublicCreationReussiePage
