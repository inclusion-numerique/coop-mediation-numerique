import { countThematiques } from '@app/web/beneficiaire/beneficiaireQueries'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { searchActiviteAndRdvs } from '@app/web/features/activites/use-cases/list/db/searchActiviteAndRdvs'
import { consulterBeneficiaire } from '@app/web/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import { BeneficiaireId } from '@app/web/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@app/web/features/beneficiaire/domain/mediateur-id'
import type { UserId, UserRdvAccount, UserTimezone } from '@app/web/utils/user'

// Composition de hub : la fiche bénéficiaire lit ses données propres via
// l'ability consulter-beneficiaire, puis agrège les comptes transverses de la
// feature activites (thématiques, total d'activités).
export const getBeneficiaireInformationsPageData = async ({
  beneficiaireId,
  mediateurId,
  user,
}: {
  beneficiaireId: string
  // The mediateur making the request (for security check)
  mediateurId: string
  user: UserId & UserTimezone & UserRdvAccount
}) => {
  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(mediateurId),
  })
  if (!beneficiaire) {
    return null
  }

  const displayName = getBeneficiaireDisplayName(beneficiaire)

  const thematiquesCounts = await countThematiques({
    beneficiaireId,
    mediateurId,
  })

  // We reuse search logic but we only are interested by counts
  const searchResult = await searchActiviteAndRdvs({
    mediateurIds: [mediateurId],
    beneficiaireIds: [beneficiaireId],
    rdvUserIds: beneficiaire.rdvUserId ? [beneficiaire.rdvUserId] : [],
    rdvAccountIds: user.rdvAccount ? [user.rdvAccount.id] : [],
    shouldFetchRdvs: !!user.rdvAccount?.hasOauthTokens,
    shouldFetchActivites: true,
    searchParams: {
      lignes: '1',
    },
  })

  const totalActivitesCount = searchResult.matchesCount

  return {
    displayName,
    beneficiaire,
    thematiquesCounts,
    totalActivitesCount,
  }
}

export type BeneficiaireInformationsPageData = Exclude<
  Awaited<ReturnType<typeof getBeneficiaireInformationsPageData>>,
  null
>
