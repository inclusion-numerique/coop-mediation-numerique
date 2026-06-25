import ViewBeneficiaireInformationsPage from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/ViewBeneficiaireInformationsPage'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { countThematiques } from '@app/web/features/activites/use-cases/list/db/countThematiques'
import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import { notFound } from 'next/navigation'

// Route hub : lit les données propres du bénéficiaire via l'ability
// consulter-beneficiaire, puis agrège les comptes transverses de la feature
// activites (thématiques, total d'activités), et délègue le rendu à la page.
const BeneficiaireInformationsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
}) => {
  const { beneficiaireId } = await props.params
  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(mediateurId),
  })

  if (!beneficiaire) {
    notFound()
  }

  const [thematiquesCounts, searchResult] = await Promise.all([
    countThematiques({ beneficiaireId, mediateurId }),
    searchActiviteAndRdvs({
      mediateurIds: [mediateurId],
      beneficiaireIds: [beneficiaireId],
      rdvUserIds: beneficiaire.rdvUserId ? [beneficiaire.rdvUserId] : [],
      rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
      shouldFetchRdvs: !!user.rdvAccount?.hasOauthTokens,
      shouldFetchActivites: true,
      searchParams: { lignes: '1' },
    }),
  ])

  return (
    <ViewBeneficiaireInformationsPage
      data={{
        beneficiaire,
        thematiquesCounts,
        totalActivitesCount: searchResult.matchesCount,
      }}
    />
  )
}

export default BeneficiaireInformationsPage
