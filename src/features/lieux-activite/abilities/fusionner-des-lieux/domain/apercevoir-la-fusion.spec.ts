import { Courriel, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { apercevoirLaFusion } from './apercevoir-la-fusion'
import type { LieuAFusionner } from './lieu-a-fusionner'

const SOURCE = LieuId('550e8400-e29b-41d4-a716-446655440000')
const CIBLE = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')

const source: LieuAFusionner = {
  id: SOURCE,
  nom: Nom('Espace numérique'),
  adresse: null,
  siret: null,
  rna: null,
  structureCartographieNationaleId: null,
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

const cible: LieuAFusionner = {
  id: CIBLE,
  nom: Nom('Médiathèque'),
  adresse: null,
  siret: null,
  rna: null,
  structureCartographieNationaleId: null,
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

describe('apercevoir la fusion de deux lieux', () => {
  it.each<{
    cas: string
    source: LieuId | null
    cible: LieuId | null
    lus: {
      readonly source: LieuAFusionner | null
      readonly cible: LieuAFusionner | null
    }
  }>([
    {
      cas: 'ne montre rien quand le lieu à absorber n’est pas un identifiant',
      source: null,
      cible: CIBLE,
      lus: { source, cible },
    },
    {
      cas: 'ne montre rien quand le lieu à conserver n’est pas un identifiant',
      source: SOURCE,
      cible: null,
      lus: { source, cible },
    },
    {
      cas: 'ne montre rien quand le lieu à absorber est introuvable',
      source: SOURCE,
      cible: CIBLE,
      lus: { source: null, cible },
    },
    {
      cas: 'ne montre rien quand le lieu à conserver est introuvable',
      source: SOURCE,
      cible: CIBLE,
      lus: { source, cible: null },
    },
  ])('$cas', async ({ source: deLaSource, cible: deLaCible, lus }) => {
    expect(
      await apercevoirLaFusion({ lieuxAApercevoir: async () => lus })({
        source: deLaSource,
        cible: deLaCible,
      }),
    ).toEqual(failure({ _tag: 'FusionIntrouvable' }))
  })

  it('montre les deux lieux et, champ par champ, les valeurs qu’ils partagent', async () => {
    expect(
      await apercevoirLaFusion({
        lieuxAApercevoir: async () => ({ source, cible }),
      })({ source: SOURCE, cible: CIBLE }),
    ).toEqual(
      success({
        mergeSource: source,
        mergeTarget: cible,
        mergeCommon: {
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
        },
      }),
    )
  })
})
