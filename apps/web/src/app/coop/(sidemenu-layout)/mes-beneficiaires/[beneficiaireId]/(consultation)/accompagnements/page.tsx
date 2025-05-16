import ViewBeneficiaireAccompagnementsPage from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/ViewBeneficiaireAccompagnementsPage'
import { getBeneficiaireAccompagnementsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/accompagnements/getBeneficiaireAccompagnementsPageData'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { notFound } from 'next/navigation'

const BeneficiaireAccompagnementsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
}) => {
  const params = await props.params

  const { beneficiaireId } = params

  const user = await authenticateMediateur()

  const data = await getBeneficiaireAccompagnementsPageData({
    beneficiaireId,
    mediateurId: user.mediateur.id,
    user,
  })

  if (!data) {
    notFound()
    return null
  }

  return <ViewBeneficiaireAccompagnementsPage data={data} />
}

export default BeneficiaireAccompagnementsPage
