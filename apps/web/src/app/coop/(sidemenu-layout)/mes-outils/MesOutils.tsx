import CoopBreadcrumbs from '@app/web/app/coop/CoopBreadcrumbs'
import CoopPageContainer from '@app/web/app/coop/CoopPageContainer'
import { getAuthenticatedSessionUser } from '@app/web/auth/getSessionUser'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import { AbcDiagLogo } from '@app/web/features/pictograms/services/AbcDiagLogo'
import { AidantsConnectLogo } from '@app/web/features/pictograms/services/AidantsConnectLogo'
import { CartographieLogo } from '@app/web/features/pictograms/services/CartographieLogo'
import { LesBasesLogo } from '@app/web/features/pictograms/services/LesBasesLogo'
import { PixOrgaLogo } from '@app/web/features/pictograms/services/PixOrgaLogo'
import { RDVServicePublicLogo } from '@app/web/features/pictograms/services/RDVServicePublicLogo'
import RdvServicePublicStatusTag from '@app/web/rdv-service-public/RdvServicePublicStatusTag'
import { getRdvOauthIntegrationStatus } from '@app/web/rdv-service-public/rdvIntegrationOauthStatus'
import { rdvWebsiteLink } from '@app/web/rdv-service-public/rdvServicePublicUrls'
import { contentId } from '@app/web/utils/skipLinks'
import Image from 'next/image'
import React from 'react'
import { CardOutil } from './_components/CardOutil'

export const MesOutils = async () => {
  const user = await getAuthenticatedSessionUser()

  const rdvServicePublicStatus = getRdvOauthIntegrationStatus({ user })

  return (
    <CoopPageContainer size={56}>
      <CoopBreadcrumbs currentPage="Mes outils" />
      <SkipLinksPortal />
      <main id={contentId}>
        <h1 className="fr-text-title--blue-france fr-mb-1v">Mes outils</h1>
        <p className="fr-text-mention--grey">
          Retrouvez des outils utiles dans votre pratique de la médiation
          numérique. Découvrez leurs fonctionnalités clés et comment accéder à
          ces outils.
        </p>
        <section className="fr-mt-6w">
          <h2 className="fr-h6 fr-text-mention--grey">
            <span
              className="ri-service-line ri-lg fr-text--regular fr-mr-1w"
              aria-hidden
            />
            Des outils pour vos accompagnements
          </h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={RDVServicePublicLogo}
                title="RDV Service Public"
                slug="rdv-service-public/se-connecter"
                accessUrl={rdvWebsiteLink}
                isNew={rdvServicePublicStatus === 'none'}
                topRight={
                  rdvServicePublicStatus !== 'none' && (
                    <RdvServicePublicStatusTag
                      status={rdvServicePublicStatus}
                    />
                  )
                }
                actionButton={{
                  title: 'Intégration à RDV Service Public',
                  children: 'Paramétrer l’intégration',
                  iconId: 'fr-icon-settings-5-line',
                }}
              >
                Faciliter la gestion des rendez-vous avec vos bénéficiaires.
              </CardOutil>
            </div>
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={AidantsConnectLogo}
                title="Aidants Connect"
                slug="aidants-connect"
                accessUrl="https://aidantsconnect.beta.gouv.fr/accounts/login/"
              >
                Sécuriser l’aidant et la personne accompagnée dans la
                réalisation de démarches administratives en ligne.
              </CardOutil>
            </div>
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={CartographieLogo}
                title="La Cartographie Nationale des lieux d’inclusion numérique"
                slug="cartographie-nationale-des-lieux-d-inclusion-numerique"
                accessUrl="https://cartographie.societenumerique.gouv.fr"
              >
                Rendre visible vos lieux et services d’inclusion numérique pour
                faciliter l’orientation des bénéficiaires.
              </CardOutil>
            </div>
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={LesBasesLogo}
                title="Les Bases du numérique d’intérêt général"
                slug="les-bases-du-numerique-d-interet-general"
                accessUrl="https://lesbases.anct.gouv.fr/connexion"
              >
                La plateforme collaborative de partage de ressources & communs
                numériques à l’échelle nationale.
              </CardOutil>
            </div>
          </div>
        </section>
        <section className="fr-mt-6w">
          <h2 className="fr-h6 fr-text-mention--grey fr-flex fr-align-items-center">
            <Image
              className="fr-mr-1w fr-img--grayscale"
              width={26}
              height={26}
              src="/images/services/pix.svg"
              alt=""
            />
            Les outils Pix dédiés à la médiation numérique
          </h2>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={PixOrgaLogo}
                title="Pix Orga"
                slug="pix"
                accessUrl="https://orga.pix.fr/connexion"
              >
                Proposez des parcours PIX adaptés aux besoins de vos apprenants
                et suivez leur progression.
              </CardOutil>
            </div>
            <div className="fr-col-xl-6 fr-col-12">
              <CardOutil
                pictogram={AbcDiagLogo}
                title="ABC Diag"
                slug="abc-diag"
                accessUrl="https://pix.fr/abc-diag"
              >
                Diagnostiquez en 10 questions la maîtrise de compétences
                numériques de base.
              </CardOutil>
            </div>
          </div>
        </section>
      </main>
    </CoopPageContainer>
  )
}
