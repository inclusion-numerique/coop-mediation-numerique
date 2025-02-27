import ArchivesV1CoordinateurPageContent from '@app/web/app/coop/(full-width-layout)/archives-v1/ArchivesV1CoordinateurPageContent'
import ArchivesV1PageContent from '@app/web/app/coop/(full-width-layout)/archives-v1/ArchivesV1PageContent'
import { getArchivesV1CoordinateurPageData } from '@app/web/app/coop/(full-width-layout)/archives-v1/getArchivesV1CoordinateurPageData'
import { getArchivesV1PageDataWithCras } from '@app/web/app/coop/(full-width-layout)/archives-v1/getArchivesV1PageData'
import { authenticateConseillerNumeriqueOrCoordinateur } from '@app/web/auth/authenticateUser'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ArchivesV1Page = async () => {
  const user = await authenticateConseillerNumeriqueOrCoordinateur()

  if (user.coordinateur) {
    const coordinateurV1Id = user.coordinateur.conseillerNumeriqueId

    if (coordinateurV1Id === null)
      throw new Error('Coordinateur is not linked to a conseiller numerique')

    const archivesV1CoordinateurPageData =
      await getArchivesV1CoordinateurPageData({
        coordinateurV1Id,
      })

    return (
      <ArchivesV1CoordinateurPageContent
        data={archivesV1CoordinateurPageData}
      />
    )
  }

  // Not necessary but typescript does not understand that at this point conseillerNumeriqueId is not null
  if (user.mediateur?.conseillerNumerique) {
    const conseillerNumeriqueId = user.mediateur.conseillerNumerique.id

    const archivesV1PageData = await getArchivesV1PageDataWithCras({
      conseillerNumeriqueIds: [conseillerNumeriqueId],
    })

    return (
      <ArchivesV1PageContent
        data={archivesV1PageData}
        conseillerNumeriqueV1Id={conseillerNumeriqueId}
      />
    )
  }

  notFound()
  return null
}

export default ArchivesV1Page
