import ViewBeneficiaireInformationsPage from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/ViewBeneficiaireInformationsPage'
import { getBeneficiaireInformationsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/getBeneficiaireInformationsPageData'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { notFound } from 'next/navigation'

const BeneficiaireInformationsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
}) => {
  const params = await props.params

  const { beneficiaireId } = params

  const user = await authenticateMediateur()

  const data = await getBeneficiaireInformationsPageData({
    beneficiaireId,
    mediateurId: user.mediateur.id,
  })

  if (!data) {
    notFound()
    return null
  }

  return <ViewBeneficiaireInformationsPage data={data} />
}

export default BeneficiaireInformationsPage
