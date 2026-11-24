import Image from 'next/image'
import type { ReactNode } from 'react'
import SkipLinksPortal from '@/libraries/liens-d-evitement/SkipLinksPortal'
import { contentId } from '@/libraries/liens-d-evitement/skip-links'
import { AbcDiagLogo } from '@/libraries/pictograms/services/AbcDiagLogo'
import { PixOrgaLogo } from '@/libraries/pictograms/services/PixOrgaLogo'
import { RDVServicePublicLogo } from '@/libraries/pictograms/services/RDVServicePublicLogo'
import CoopBreadcrumbs from '@/libraries/ui/components/CoopBreadcrumbs'
import CoopPageContainer from '@/libraries/ui/components/CoopPageContainer'
import type { ProfilOutils } from '../../domain'
import { CardOutil } from '../components/CardOutil'
import { outilsAccompagnementsVisibles } from '../presenters/catalogue.presenter'

export type RdvServicePublicDansMesOutils = {
  readonly lien: string
  readonly integrationDisponible: boolean
  readonly etiquette: ReactNode
}

export const MesOutilsPage = ({
  profil,
  rdvServicePublic,
}: {
  profil: ProfilOutils
  rdvServicePublic: RdvServicePublicDansMesOutils
}) => (
  <CoopPageContainer size={56}>
    <CoopBreadcrumbs currentPage="Mes outils" />
    <SkipLinksPortal />
    <main id={contentId}>
      <h1 className="fr-text-title--blue-france fr-mb-1v">Mes outils</h1>
      <p className="fr-text-mention--grey">
        Retrouvez des outils utiles dans votre pratique de la médiation
        numérique. Découvrez leurs fonctionnalités clés et comment accéder à ces
        outils.
      </p>
      <section className="fr-mt-6w">
        <h2 className="fr-h6 fr-text-mention--grey">
          <span
            className="ri-service-line fr-text--regular fr-mr-1w"
            aria-hidden
          />
          Des outils pour vos accompagnements
        </h2>
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-xl-6 fr-col-12">
            <CardOutil
              pictogram={RDVServicePublicLogo}
              title="RDV Service Public"
              slug="rdv-service-public"
              accessUrl={rdvServicePublic.lien}
              isNew={rdvServicePublic.integrationDisponible}
              topRight={rdvServicePublic.etiquette}
              actionButton={{
                title: 'Intégration à RDV Service Public',
                children: 'Paramétrer l’intégration',
                iconId: 'fr-icon-settings-5-line',
              }}
            >
              Faciliter la gestion des rendez-vous avec vos bénéficiaires.
            </CardOutil>
          </div>
          {outilsAccompagnementsVisibles(profil).map(
            ({ pictogram, title, slug, accessUrl, description }) => (
              <div key={title} className="fr-col-xl-6 fr-col-12">
                <CardOutil
                  pictogram={pictogram}
                  title={title}
                  slug={slug}
                  accessUrl={accessUrl}
                >
                  {description}
                </CardOutil>
              </div>
            ),
          )}
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
              Proposez des parcours PIX adaptés aux besoins de vos apprenants et
              suivez leur progression.
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
