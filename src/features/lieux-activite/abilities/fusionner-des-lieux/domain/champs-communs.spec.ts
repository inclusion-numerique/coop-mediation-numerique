import { Courriel } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { champsCommuns } from './champs-communs'
import type { ChampsPartageables } from './lieu-a-fusionner'

describe('les champs communs à deux lieux à fusionner', () => {
  const aucunChamp: ChampsPartageables = {
    employesIds: [],
    mediateursEnActiviteIds: [],
    activitesEmployeurIds: [],
    activitesLieuIds: [],
    typologies: [],
    services: [],
    publicsSpecifiquementAdresses: [],
    priseEnChargeSpecifique: [],
    fraisACharge: [],
    dispositifProgrammesNationaux: [],
    formationsLabels: [],
    autresFormationsLabels: [],
    itinerance: [],
    modalitesAcces: [],
    modalitesAccompagnement: [],
    courriels: [],
  }

  it('sont vides quand les deux lieux n’ont aucun champ', () => {
    expect(champsCommuns(aucunChamp, aucunChamp)).toEqual(aucunChamp)
  })

  it('ne gardent que les employés présents dans les deux lieux', () => {
    const source: ChampsPartageables = {
      ...aucunChamp,
      employesIds: ['user-1', 'user-2', 'user-3'],
    }
    const target: ChampsPartageables = {
      ...aucunChamp,
      employesIds: ['user-2', 'user-3', 'user-4'],
    }

    const communs = champsCommuns(source, target)

    expect(communs.employesIds).toEqual(['user-2', 'user-3'])
  })

  it('ne gardent que les typologies présentes dans les deux lieux', () => {
    const source: ChampsPartageables = {
      ...aucunChamp,
      typologies: ['ASSO', 'CCAS'],
    }
    const target: ChampsPartageables = {
      ...aucunChamp,
      typologies: ['CCAS', 'MAIRIE'],
    }

    const communs = champsCommuns(source, target)

    expect(communs.typologies).toEqual(['CCAS'])
  })

  it('sont vides quand les deux lieux n’ont aucune valeur en commun', () => {
    const source: ChampsPartageables = {
      ...aucunChamp,
      employesIds: ['user-1'],
      services: ['service-a'],
    }
    const target: ChampsPartageables = {
      ...aucunChamp,
      employesIds: ['user-2'],
      services: ['service-b'],
    }

    expect(champsCommuns(source, target)).toEqual(aucunChamp)
  })

  it('ne gardent, champ par champ, que les valeurs présentes dans les deux lieux', () => {
    const source: ChampsPartageables = {
      employesIds: ['e1', 'e2'],
      mediateursEnActiviteIds: [
        MediateurId('0927f824-b84d-4840-ae2e-e4a96a7a519b'),
        MediateurId('f98724ab-93d2-46cd-bff6-1821dd6a6da7'),
      ],
      activitesEmployeurIds: ['ae1'],
      activitesLieuIds: ['al1', 'al2'],
      typologies: ['t1'],
      services: ['s1', 's2'],
      publicsSpecifiquementAdresses: ['p1'],
      priseEnChargeSpecifique: ['pc1'],
      fraisACharge: ['f1'],
      dispositifProgrammesNationaux: ['d1', 'd2'],
      formationsLabels: ['fl1'],
      autresFormationsLabels: ['afl1'],
      itinerance: ['i1'],
      modalitesAcces: ['ma1'],
      modalitesAccompagnement: ['mac1'],
      courriels: [Courriel('c1@test.fr')],
    }
    const target: ChampsPartageables = {
      employesIds: ['e2', 'e3'],
      mediateursEnActiviteIds: [
        MediateurId('f98724ab-93d2-46cd-bff6-1821dd6a6da7'),
        MediateurId('00efad2c-0d71-43e3-a174-9e0c2defa083'),
      ],
      activitesEmployeurIds: ['ae2'],
      activitesLieuIds: ['al2', 'al3'],
      typologies: ['t2'],
      services: ['s2', 's3'],
      publicsSpecifiquementAdresses: ['p2'],
      priseEnChargeSpecifique: ['pc2'],
      fraisACharge: ['f2'],
      dispositifProgrammesNationaux: ['d2', 'd3'],
      formationsLabels: ['fl2'],
      autresFormationsLabels: ['afl2'],
      itinerance: ['i2'],
      modalitesAcces: ['ma2'],
      modalitesAccompagnement: ['mac2'],
      courriels: [Courriel('c2@test.fr')],
    }

    const communs = champsCommuns(source, target)

    expect(communs).toEqual({
      employesIds: ['e2'],
      mediateursEnActiviteIds: [
        MediateurId('f98724ab-93d2-46cd-bff6-1821dd6a6da7'),
      ],
      activitesEmployeurIds: [],
      activitesLieuIds: ['al2'],
      typologies: [],
      services: ['s2'],
      publicsSpecifiquementAdresses: [],
      priseEnChargeSpecifique: [],
      fraisACharge: [],
      dispositifProgrammesNationaux: ['d2'],
      formationsLabels: [],
      autresFormationsLabels: [],
      itinerance: [],
      modalitesAcces: [],
      modalitesAccompagnement: [],
      courriels: [],
    })
  })
})
