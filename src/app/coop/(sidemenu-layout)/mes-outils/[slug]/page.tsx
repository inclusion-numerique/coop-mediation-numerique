import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { metadataTitle } from '@/configuration/projet/metadataTitle'
import { getSessionUser } from '@/features/authentification/implementation/session/getSessionUser'
import { MediateurId } from '@/features/lieux-activite'
import { visibiliteSurLaCartographie } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie'
import { AccesCartographieNationale } from '@/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui'
import { SlugOutil } from '@/features/outils/abilities/consulter-un-outil'
import {
  emplacementsDeLOutil,
  type FournisseursDEmplacements,
  ficheDeLOutil,
  OutilPage,
  type SitesDesOutils,
} from '@/features/outils/abilities/consulter-un-outil/ui'
import RdvServicePublicAccessCard from '@/features/rdvsp/ui/RdvServicePublicAccess'
import RdvServicePublicMigrationNotice from '@/features/rdvsp/ui/RdvServicePublicMigrationNotice'
import { rdvWebsiteLink } from '@/features/rdvsp/urls'
import { CodeInsee } from '@/libraries/insee'

type Props = { params: Promise<{ slug: string }> }

const slugDeLaPage = async ({ params }: Props): Promise<SlugOutil> => {
  const slug = SlugOutil.safe((await params).slug)
  return slug ?? notFound()
}

const sites: SitesDesOutils = { rdvServicePublic: rdvWebsiteLink }

const fournisseurs: FournisseursDEmplacements = {
  'rdv-service-public': async () => ({
    avis: <RdvServicePublicMigrationNotice />,
    acces: <RdvServicePublicAccessCard />,
  }),
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
