import {
  beneficiaireMaximaleMediateurAvecActivite,
  beneficiaireSansAccompagnementsMediateurAvecActivite,
} from '@app/fixtures/beneficiaires'
import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { prismaClient } from '@app/web/prismaClient'
import {
  type CountThematiquesResult,
  countThematiques,
} from './countThematiques'

describe('countThematiques', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await refreshFixturesComputedFields()
  })

  it('returns no thematiques for a beneficiaire with no accompagnement', async () => {
    const { id: beneficiaireId, mediateurId } =
      beneficiaireSansAccompagnementsMediateurAvecActivite

    expect(await countThematiques({ beneficiaireId, mediateurId })).toEqual([])
  })

  it('counts thematiques across a beneficiaire accompagnements', async () => {
    const { id: beneficiaireId, mediateurId } =
      beneficiaireMaximaleMediateurAvecActivite

    const expected = [
      {
        count: 2,
        enumValue: 'aide_aux_demarches_administratives',
        label: 'Aide aux démarches administratives',
        thematique: 'AideAuxDemarchesAdministratives',
      },
      {
        count: 1,
        enumValue: 'culture_numerique',
        label: 'Culture numérique',
        thematique: 'CultureNumerique',
      },
      {
        count: 3,
        enumValue: 'email',
        label: 'E-mail',
        thematique: 'Email',
      },
      {
        count: 1,
        enumValue: 'justice',
        label: 'Justice',
        thematique: 'Justice',
      },
      {
        count: 1,
        enumValue: 'logement',
        label: 'Logement',
        thematique: 'Logement',
      },
      {
        count: 1,
        enumValue: 'parentalite',
        label: 'Parentalité',
        thematique: 'Parentalite',
      },
      {
        count: 2,
        enumValue: 'reseaux_sociaux',
        label: 'Réseaux sociaux communication',
        thematique: 'ReseauxSociaux',
      },
      {
        count: 2,
        enumValue: 'social_sante',
        label: 'Social - Santé',
        thematique: 'SocialSante',
      },
    ] satisfies CountThematiquesResult

    expect(await countThematiques({ beneficiaireId, mediateurId })).toEqual(
      expected,
    )
  })
})
