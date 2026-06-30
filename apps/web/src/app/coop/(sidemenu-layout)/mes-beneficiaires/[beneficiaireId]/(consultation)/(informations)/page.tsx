import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { countThematiques } from '@app/web/features/activites/use-cases/list/db/countThematiques'
import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import ViewBeneficiaireInformationsPage from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireInformationsPage'
import { DeleteBeneficiaireModal } from '@app/web/features/beneficiaire/abilities/supprimer-beneficiaires/ui/components/DeleteBeneficiaireModal'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import Button from '@codegouvfr/react-dsfr/Button'
import { notFound } from 'next/navigation'

// Route hub : lit les données propres du bénéficiaire via l'ability
// consulter-beneficiaire, agrège les comptes activites, puis rend la page en lui
// injectant les actions d'en-tête (modifier, supprimer) — concerns croisés.
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
      actions={
        <div>
          <Button
            iconId="fr-icon-edit-line"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            linkProps={{
              href: `/coop/mes-beneficiaires/${beneficiaire.id}/modifier`,
            }}
          >
            Modifier
          </Button>
          <Button
            iconId="fr-icon-delete-bin-line"
            className="fr-ml-1v"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            type="button"
            {...DeleteBeneficiaireModal.buttonProps}
          >
            Supprimer
          </Button>
        </div>
      }
    />
  )
}

export default BeneficiaireInformationsPage
