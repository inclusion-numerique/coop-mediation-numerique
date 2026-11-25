import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { declencherSynchronisationAction } from '@/app/_actions/rdvsp/declencher-synchronisation.action'
import { deconnecterCompteRdvAction } from '@/app/_actions/rdvsp/deconnecter-compte-rdv.action'
import { estMain, metadataTitle } from '@/configuration/projet'
import {
  getAuthenticatedSessionUser,
  getSessionUser,
} from '@/features/authentification/middlewares/with-utilisateur-de-la-session'
import { visibiliteSurLaCartographie } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/implementations/prisma/visibilite-sur-la-cartographie.query'
import { AccesCartographieNationale } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui/slots/AccesCartographieNationale.slot'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { SlugOutil } from '@/features/outils/abilities/consulter-un-outil/domain/index'
import { OutilPage } from '@/features/outils/abilities/consulter-un-outil/ui/pages/OutilPage'
import {
  emplacementsDeLOutil,
  type FournisseursDEmplacements,
} from '@/features/outils/abilities/consulter-un-outil/ui/presenters/emplacements-de-l-outil.presenter'
import {
  ficheDeLOutil,
  type SitesDesOutils,
} from '@/features/outils/abilities/consulter-un-outil/ui/presenters/fiche-de-l-outil.presenter'
import { DECLENCHER_SYNCHRONISATION_ACTION_KEY } from '@/features/rdvsp/action/declencher-synchronisation.key'
import { DECONNECTER_COMPTE_RDV_ACTION_KEY } from '@/features/rdvsp/action/deconnecter-compte-rdv.key'
import { lienDeConnexionARdvServicePublic } from '@/features/rdvsp/implementations/oauth/rdvsp-oauth-callback.client'
import { lienDuSiteRdv } from '@/features/rdvsp/ui/presenters/liens.presenter'
import RdvServicePublicAccessCard from '@/features/rdvsp/ui/slots/RdvServicePublicAccess.slot'
import RdvServicePublicMigrationNotice from '@/features/rdvsp/ui/slots/RdvServicePublicMigrationNotice.slot'
import { CodeInsee } from '@/libraries/insee'
import { ClientBinder } from '@/libraries/nextjs/injection'

type Props = { params: Promise<{ slug: string }> }

const slugDeLaPage = async ({ params }: Props): Promise<SlugOutil> => {
  const slug = SlugOutil.safe((await params).slug)
  return slug ?? notFound()
}

const sites: SitesDesOutils = { rdvServicePublic: lienDuSiteRdv(estMain()) }

const fournisseurs: FournisseursDEmplacements = {
  'rdv-service-public': async () => {
    const user = await getAuthenticatedSessionUser()
    return {
      avis: <RdvServicePublicMigrationNotice rdvAccount={user.rdvAccount} />,
      acces: (
        <ClientBinder
          bind={DECLENCHER_SYNCHRONISATION_ACTION_KEY}
          to={declencherSynchronisationAction}
        >
          <ClientBinder
            bind={DECONNECTER_COMPTE_RDV_ACTION_KEY}
            to={deconnecterCompteRdvAction}
          >
            <RdvServicePublicAccessCard
              user={user}
              lienDeConnexion={lienDeConnexionARdvServicePublic()}
              lienDuSiteRdv={lienDuSiteRdv(estMain())}
            />
          </ClientBinder>
        </ClientBinder>
      ),
    }
  },
  'cartographie-nationale-des-lieux-d-inclusion-numerique': async () => {
    const user = await getSessionUser()
    return {
      acces: (
        <AccesCartographieNationale
          {...(await visibiliteSurLaCartographie({
            mediateurId: user?.mediateur
              ? MediateurId(user.mediateur.id)
              : null,
            employeuse: CodeInsee.safe(
              user?.emplois?.at(0)?.structure.codeInsee ?? '',
            ),
          }))}
        />
      ),
    }
  },
}

export const generateMetadata = async (props: Props): Promise<Metadata> => ({
  title: metadataTitle(
    `${ficheDeLOutil(await slugDeLaPage(props), sites).title} - Mes outils`,
  ),
})

const Page = async (props: Props) => {
  const slug = await slugDeLaPage(props)

  return (
    <OutilPage
      {...ficheDeLOutil(slug, sites)}
      emplacements={await emplacementsDeLOutil(slug, fournisseurs)}
    />
  )
}

export default Page
