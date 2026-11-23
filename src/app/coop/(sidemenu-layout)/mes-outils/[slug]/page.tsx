import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { declencherSynchronisationAction } from '@/app/_actions/rdvsp/declencher-synchronisation.action'
import { deconnecterCompteRdvAction } from '@/app/_actions/rdvsp/deconnecter-compte-rdv.action'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import {
  getAuthenticatedSessionUser,
  getSessionUser,
} from '@/features/authentification/implementations/session/getSessionUser'
import { visibiliteSurLaCartographie } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie'
import { AccesCartographieNationale } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui'
import { MediateurId } from '@/features/lieux-activite/domain/identifiants/mediateur-id'
import { SlugOutil } from '@/features/outils/abilities/consulter-un-outil'
import {
  emplacementsDeLOutil,
  type FournisseursDEmplacements,
  ficheDeLOutil,
  OutilPage,
  type SitesDesOutils,
} from '@/features/outils/abilities/consulter-un-outil/ui'
import { lienDeConnexionARdvServicePublic } from '@/features/rdvsp/implementations/oauth/oauth'
import { DECLENCHER_SYNCHRONISATION_ACTION_KEY } from '@/features/rdvsp/ui/declencher-synchronisation.key'
import { DECONNECTER_COMPTE_RDV_ACTION_KEY } from '@/features/rdvsp/ui/deconnecter-compte-rdv.key'
import RdvServicePublicAccessCard from '@/features/rdvsp/ui/RdvServicePublicAccess'
import RdvServicePublicMigrationNotice from '@/features/rdvsp/ui/RdvServicePublicMigrationNotice'
import { rdvWebsiteLink } from '@/features/rdvsp/ui/urls'
import { CodeInsee } from '@/libraries/insee'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

type Props = { params: Promise<{ slug: string }> }

const slugDeLaPage = async ({ params }: Props): Promise<SlugOutil> => {
  const slug = SlugOutil.safe((await params).slug)
  return slug ?? notFound()
}

const sites: SitesDesOutils = { rdvServicePublic: rdvWebsiteLink }

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
