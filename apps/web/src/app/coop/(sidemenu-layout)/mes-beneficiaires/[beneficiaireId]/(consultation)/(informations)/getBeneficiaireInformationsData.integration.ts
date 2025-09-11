import {
  beneficiaireMaximaleMediateurAvecActivite,
  beneficiaireSansAccompagnementsMediateurAvecActivite,
} from '@app/fixtures/beneficiaires'
import { refreshFixturesComputedFields } from '@app/fixtures/refreshFixturesComputedFields'
import { resetFixtureUser } from '@app/fixtures/resetFixtureUser'
import { seedStructures } from '@app/fixtures/structures'
import { mediateurAvecActivite } from '@app/fixtures/users/mediateurAvecActivite'
import { getBeneficiaireInformationsPageData } from '@app/web/app/coop/(sidemenu-layout)/mes-beneficiaires/[beneficiaireId]/(consultation)/(informations)/getBeneficiaireInformationsPageData'
import { CountThematiquesResult } from '@app/web/beneficiaire/beneficiaireQueries'
import { getBeneficiaireDisplayName } from '@app/web/beneficiaire/getBeneficiaireDisplayName'
import { prismaClient } from '@app/web/prismaClient'

describe('getBeneficiaireInformationsData', () => {
  beforeAll(async () => {
    await seedStructures(prismaClient)
    await resetFixtureUser(mediateurAvecActivite, false)
    await refreshFixturesComputedFields()
  })

  it('returns no thematiques for beneficiaire with no data', async () => {
    const beneficiaire = beneficiaireSansAccompagnementsMediateurAvecActivite
    const beneficiaireId = beneficiaire.id
    const { mediateurId } = beneficiaire

    const {
      adresse,
      anneeNaissance,
      commune,
      communeCodeInsee,
      communeCodePostal,
      creation,
      email,
      genre,
      id,
      nom,
      notes,
      pasDeTelephone,
      prenom,
      statutSocial,
      telephone,
      trancheAge,
    } = beneficiaire

    expect(
      await getBeneficiaireInformationsPageData({
        mediateurId,
        beneficiaireId,
        user: {
          id: 'test',
          rdvAccount: null,
          timezone: 'Europe/Paris',
        },
      }),
    ).toEqual({
      beneficiaire: {
        adresse,
        anneeNaissance,
        commune,
        communeCodeInsee,
        communeCodePostal,
        creation,
        email,
        genre,
        id,
        mediateurId,
        nom,
        notes,
        pasDeTelephone,
        prenom,
        statutSocial,
        telephone,
        trancheAge,
        rdvServicePublicId: null,
        accompagnementsCount: 0,
      },
      displayName: getBeneficiaireDisplayName(beneficiaire),
      thematiquesCounts: [],
      totalActivitesCount: 0,
    })
  })

  it('returns thematiques for beneficiaire with cras', async () => {
    const beneficiaire = beneficiaireMaximaleMediateurAvecActivite
    const beneficiaireId = beneficiaire.id
    const { mediateurId } = beneficiaire

    const {
      adresse,
      anneeNaissance,
      commune,
      communeCodeInsee,
      communeCodePostal,
      creation,
      email,
      genre,
      id,
      nom,
      notes,
      pasDeTelephone,
      prenom,
      statutSocial,
      telephone,
      trancheAge,
    } = beneficiaire

    const expectedThematiqueCounts = [
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

    expect(
      await getBeneficiaireInformationsPageData({
        mediateurId,
        beneficiaireId,
        user: {
          id: 'test',
          rdvAccount: null,
          timezone: 'Europe/Paris',
        },
      }),
    ).toEqual({
      beneficiaire: {
        accompagnementsCount: 6,
        adresse,
        anneeNaissance,
        commune,
        communeCodeInsee,
        communeCodePostal,
        creation,
        email,
        genre,
        id,
        nom,
        notes,
        pasDeTelephone,
        prenom,
        statutSocial,
        telephone,
        trancheAge,
        mediateurId,
        rdvServicePublicId: null,
      },
      displayName: getBeneficiaireDisplayName(beneficiaire),
      thematiquesCounts: expectedThematiqueCounts,
      totalActivitesCount: 6,
    })
  })
})
