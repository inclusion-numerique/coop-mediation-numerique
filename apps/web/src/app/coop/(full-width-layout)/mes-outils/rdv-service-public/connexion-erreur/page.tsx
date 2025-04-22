import RdvServicePubliqueConnexionCard from '@app/web/app/coop/(full-width-layout)/mes-outils/rdv-service-public/RdvServicePubliqueConnexionCard'
import React from 'react'

const RdvServicePublicConnexionErreurPage = () => {
  return (
    <div className="fr-mb-32v fr-mt-10v">
      <RdvServicePubliqueConnexionCard title="Créer son compte avec ProConnect">
        <div className="fr-grid-row fr-grid-row--center">
          <picture>
            <img
              src="/dsfr/artwork/pictograms/digital/mail-send.svg"
              alt="Boite email"
              style={{ textAlign: 'center', width: 96 }}
            />
          </picture>
        </div>
        <h1 className="fr-mt-4v fr-h2 fr-text-title--blue-france fr-mb-4v fr-text--center">
          TODO
        </h1>
        <p className="fr-mb-4v  fr-text--center">TODO</p>
        <p className="fr-text--xs fr-mb-0  fr-text--center">
          Vous pouvez fermer cet onglet de navigation.
          <br />
          En cas de problème ou de questions, merci de contacter le support de
          RDV&nbsp;Service&nbsp;Public&nbsp;:{' '}
          <a
            className="fr-link fr-link--xs"
            href="mailto:support@rdv-service-public.fr"
          >
            support@rdv-service-public.fr
          </a>
        </p>
      </RdvServicePubliqueConnexionCard>
    </div>
  )
}

export default RdvServicePublicConnexionErreurPage
