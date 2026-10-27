import { metadataTitle } from '@app/web/app/metadataTitle'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import { MediateurId } from '@app/web/features/lieux-activite'
import { visibiliteSurLaCartographie } from '@app/web/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie'
import { AccesCartographieNationale } from '@app/web/features/lieux-activite/abilities/mesurer-la-visibilite-sur-la-cartographie/ui'
import { SlugOutil } from '@app/web/features/outils/abilities/consulter-un-outil'
import {
  type EmplacementsDeLaFiche,
  ficheDeLOutil,
  OutilPage,
} from '@app/web/features/outils/abilities/consulter-un-outil/ui'
import RdvServicePublicAccessCard from '@app/web/features/rdvsp/ui/RdvServicePublicAccess'
import RdvServicePublicMigrationNotice from '@app/web/features/rdvsp/ui/RdvServicePublicMigrationNotice'
import { CodeInsee } from '@app/web/libraries/departement'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

const slugDeLaPage = async ({ params }: Props): Promise<SlugOutil> => {
  const slug = SlugOutil.safe((await params).slug)
  return slug ?? notFound()
}

const accesALaCartographie = async (): Promise<EmplacementsDeLaFiche> => {
  const user = await getSessionUser()

  return {
    acces: (
      <AccesCartographieNationale
        {...(await visibiliteSurLaCartographie({
          mediateurId: user?.mediateur ? MediateurId(user.mediateur.id) : null,
          employeuse: CodeInsee.safe(
            user?.emplois?.at(0)?.structure.codeInsee ?? '',
          ),
        }))}
      />
    ),
  }
}

const emplacementsDeLOutil = async (
  slug: SlugOutil,
): Promise<EmplacementsDeLaFiche> =>
  slug === 'rdv-service-public'
    ? {
        avis: <RdvServicePublicMigrationNotice />,
        acces: <RdvServicePublicAccessCard />,
      }
    : slug === 'cartographie-nationale-des-lieux-d-inclusion-numerique'
      ? accesALaCartographie()
      : {}

export const generateMetadata = async (props: Props): Promise<Metadata> => ({
  title: metadataTitle(
    `${ficheDeLOutil(await slugDeLaPage(props)).title} - Mes outils`,
  ),
})

const Page = async (props: Props) => {
  const slug = await slugDeLaPage(props)

  return (
    <OutilPage
      {...ficheDeLOutil(slug)}
      emplacements={await emplacementsDeLOutil(slug)}
    />
  )
}

export default Page
