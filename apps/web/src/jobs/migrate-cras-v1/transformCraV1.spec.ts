import { Thematique, TypeActivite, TypeLieu, TrancheAge } from '@prisma/client'
import type { CraConseillerNumeriqueV1 } from '@prisma/client'
import { transformCraV1 } from './transformCraV1'

function createBaseCra(
  overrides: Partial<CraConseillerNumeriqueV1> = {},
): CraConseillerNumeriqueV1 {
  const base: CraConseillerNumeriqueV1 = {
    id: 'cra-1',
    importedAt: new Date('2024-11-19T13:40:27.325Z'),
    v1ConseillerNumeriqueId: 'v1-cons-1',
    canal: 'autre lieu',
    activite: 'collectif',
    nbParticipants: 5,
    nbParticipantsRecurrents: 0,
    ageMoins12Ans: 0,
    ageDe12a18Ans: 0,
    ageDe18a35Ans: 0,
    ageDe35a60Ans: 0,
    agePlus60Ans: 0,
    statutEtudiant: 0,
    statutSansEmploi: 0,
    statutEnEmploi: 0,
    statutRetraite: 0,
    statutHeterogene: 0,
    themes: [],
    sousThemesEquipementInformatique: [],
    sousThemesSante: [],
    sousThemesAccompagner: [],
    sousThemesTraitementTexte: [],
    duree: '60',
    dureeMinutes: 60,
    accompagnementIndividuel: 0,
    accompagnementAtelier: 0,
    accompagnementRedirection: 0,
    codePostal: '33370',
    nomCommune: 'Tresses',
    dateAccompagnement: new Date('2022-03-18T16:17:23.000Z'),
    codeCommune: '33535',
    organismes: null,
    annotation: null,
    createdAt: new Date('2022-03-20T16:20:07.216Z'),
    updatedAt: null,
    structureId: 'v1-struct-1',
    structureIdPg: 2530,
    structureType: 'EPCI',
    structureStatut: 'VALIDATION_COSELEC',
    structureNom: 'COMMUNAUTE DE COMMUNES DES COTEAUX BORDELAIS',
    structureSiret: '24330135500034',
    structureCodePostal: '33370',
    structureNomCommune: 'Tresses',
    structureCodeCommune: '33535',
    structureCodeDepartement: '33',
    structureCodeRegion: '75',
    permanenceId: null,
    permanenceEstStructure: null,
    permanenceNomEnseigne: null,
    permanenceNumeroTelephone: null,
    permanenceEmail: null,
    permanenceSiteWeb: null,
    permanenceSiret: null,
    permanenceAdresse: null,
    permanenceCodePostal: null,
    permanenceNomCommune: null,
    permanenceCodeCommune: null,
    permanenceLatitude: null,
    permanenceLongitude: null,
    permanenceStructureId: null,
    permanenceStructureIdPg: null,
    permanenceStructureType: null,
    permanenceStructureStatut: null,
    permanenceStructureNom: null,
    permanenceStructureSiret: null,
    permanenceStructureCodePostal: null,
    permanenceStructureNomCommune: null,
    permanenceStructureCodeCommune: null,
    permanenceStructureCodeDepartement: null,
    permanenceStructureCodeRegion: null,
  }
  return { ...base, ...overrides }
}

describe('transformCraV1', () => {
  const v1StructuresIdsMap = new Map([
    [
      'v1-struct-1',
      {
        id: 'v2-struct-1',
        codePostal: '33370',
        commune: 'Tresses',
        codeInsee: '33535',
      },
    ],
  ])
  const v1PermanencesIdsMap = new Map([
    [
      'v1-perm-1',
      {
        id: 'v2-perm-1',
        codePostal: '01500',
        commune: 'Ambérieu-en-Bugey',
        codeInsee: '01004',
      },
    ],
  ])
  const v1ConseillersIdsMap = new Map([
    ['v1-cons-1', { userId: 'user-1', mediateurId: 'med-1' }],
  ])

  it('maps collectif + autre lieu + themes + organismes; uses nbParticipants for accompagnementsCount', async () => {
    const cra = createBaseCra({
      themes: ['demarche en ligne', 'internet', 'courriel'],
      duree: '120',
      dureeMinutes: null as unknown as number, // force parse path
      annotation: 'note A',
      organismes: ['france services'] as unknown as any,
    })

    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })

    expect(result.activite.type).toBe<TypeActivite>('Collectif')
    expect(result.activite.typeLieu).toBe<TypeLieu>('Autre')
    expect(result.activite.accompagnementsCount).toBe(cra.nbParticipants)
    expect(result.activite.duree).toBe(120)
    expect(result.activite.notes).toBe('note A')
    expect(result.activite.structureDeRedirection).toBe(
      'AideAuxDemarchesAdministratives',
    )
    expect(result.activite.thematiques).toEqual(
      expect.arrayContaining<Thematique>([
        'AideAuxDemarchesAdministratives',
        'NavigationSurInternet',
        'Email',
      ]),
    )
    expect(result.activite.lieuCodePostal).toBe(cra.codePostal)
    expect(result.activite.lieuCommune).toBe(cra.nomCommune)
    expect(result.activite.lieuCodeInsee).toBe(cra.codeCommune)
    expect(result.beneficiaires.length).toBe(cra.nbParticipants)
    expect(result.accompagnements.length).toBe(cra.nbParticipants)
  })

  it('maps rattachement to LieuActivite and prefers permanence mapping over structure mapping', async () => {
    const cra = createBaseCra({
      canal: 'rattachement',
      activite: 'individuel',
      permanenceId: 'v1-perm-1',
    })

    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.type).toBe<TypeActivite>('Individuel')
    expect(result.activite.typeLieu).toBe<TypeLieu>('LieuActivite')
    expect(result.activite.accompagnementsCount).toBe(1)
    expect(result.activite.structure).toEqual({ connect: { id: 'v2-perm-1' } })
    expect(result.beneficiaires.length).toBe(1)
    expect(result.accompagnements.length).toBe(1)
  })

  it('maps distance to ADistance and fetches lieu from structure employeuse via provided map', async () => {
    const cra = createBaseCra({ canal: 'distance', permanenceId: null })

    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.typeLieu).toBe<TypeLieu>('ADistance')
    // uses structure employeuse mapping from v1StructuresIdsMap
    expect(result.activite.lieuCodePostal).toBe('33370')
    expect(result.activite.lieuCommune).toBe('Tresses')
    expect(result.activite.lieuCodeInsee).toBe('33535')
    expect(result.activite.structure).toBeUndefined()
  })

  it('uses dureeMinutes if present and ignores duree string', async () => {
    const cra = createBaseCra({ duree: '0-30', dureeMinutes: 45 })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.duree).toBe(45)
  })

  it('deduplicates thematiques when duplicate themes provided', async () => {
    const cra = createBaseCra({ themes: ['internet', 'internet'] })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    const thematiquesArr: Thematique[] = Array.isArray(
      result.activite.thematiques,
    )
      ? (result.activite.thematiques as Thematique[])
      : ((result.activite.thematiques as any)?.set ?? [])
    const only = (thematiquesArr as Thematique[]).filter(
      (t: Thematique) => t === 'NavigationSurInternet',
    )
    expect(only.length).toBe(1)
  })

  it('creates anonymous beneficiaires and accompagnements for collectif with premierAccompagnement set using nbParticipantsRecurrents', async () => {
    const cra = createBaseCra({
      nbParticipants: 5,
      nbParticipantsRecurrents: 2,
    })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })

    // beneficiaries count
    expect(result.beneficiaires.length).toBe(5)
    // all anonymous and connected to mediateur
    for (const b of result.beneficiaires) {
      expect(b.anonyme).toBe(true)
      expect((b.mediateur as any).connect.id).toBe('med-1')
    }

    // accompagnements count and premierAccompagnement logic: first 2 are recurring (false), rest true
    expect(result.accompagnements.length).toBe(5)
    const flags = result.accompagnements.map((a) => a.premierAccompagnement)
    expect(flags).toEqual([false, false, true, true, true])
    // linkage matches beneficiaires
    const idsFromBeneficiaires = result.beneficiaires.map((b) => b.id)
    const idsFromAccompagnements = result.accompagnements.map(
      (a) => a.beneficiaireId,
    )
    expect(idsFromAccompagnements).toEqual(idsFromBeneficiaires)
  })

  it('creates one anonymous beneficiaire and one accompagnement for individuel with premierAccompagnement true', async () => {
    const cra = createBaseCra({ activite: 'individuel', nbParticipants: 1 })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })

    expect(result.beneficiaires.length).toBe(1)
    expect(result.accompagnements.length).toBe(1)
    expect(result.accompagnements[0].premierAccompagnement).toBe(true)
  })

  it('assigns trancheAge from non-random age buckets exactly (no 18-35 to avoid randomness)', async () => {
    const cra = createBaseCra({
      nbParticipants: 5,
      ageMoins12Ans: 2,
      ageDe12a18Ans: 1,
      ageDe18a35Ans: 0,
      ageDe35a60Ans: 2,
      agePlus60Ans: 0,
    })

    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })

    const countByTranche = (t: TrancheAge) =>
      result.beneficiaires.filter((b) => b.trancheAge === t).length

    expect(countByTranche('MoinsDeDouze')).toBe(2)
    expect(countByTranche('DouzeDixHuit')).toBe(1)
    expect(countByTranche('QuaranteCinquanteNeuf')).toBe(2)
  })

  it('falls back to structure mapping when permanence is not provided for LieuActivite', async () => {
    const cra = createBaseCra({ canal: 'autre lieu', permanenceId: null })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.typeLieu).toBe<TypeLieu>('Autre')
    expect(result.activite.structure).toEqual({
      connect: { id: 'v2-struct-1' },
    })
  })

  it('maps domicile to Domicile', async () => {
    const cra = createBaseCra({ canal: 'domicile' })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.typeLieu).toBe<TypeLieu>('Domicile')
  })

  it('parses duree in HH:MM when dureeMinutes is missing', async () => {
    const cra = createBaseCra({ duree: '01:30', dureeMinutes: null as any })
    const result = await transformCraV1(cra, {
      v1StructuresIdsMap,
      v1PermanencesIdsMap,
      v1ConseillersIdsMap,
    })
    expect(result.activite.duree).toBe(90)
  })

  it('throws when structureEmployeuse mapping is missing', async () => {
    const cra = createBaseCra({ structureId: 'unknown-struct' })
    await expect(
      transformCraV1(cra, {
        v1StructuresIdsMap,
        v1PermanencesIdsMap,
        v1ConseillersIdsMap,
      }),
    ).rejects.toThrow(/Missing required mapping for structureEmployeuseId/)
  })

  it('classifies organismes into StructureDeRedirection categories', async () => {
    const cases: Array<{ orgs: string[]; expectCat: string }> = [
      { orgs: ['caf'], expectCat: 'OperateurOuOrganismeEnCharge' },
      { orgs: ['pôle emploi'], expectCat: 'InsertionProfessionnelle' },
      { orgs: ['ccas'], expectCat: 'AideSociale' },
      { orgs: ['tiers-lieu'], expectCat: 'MediationNumerique' },
      { orgs: ['mairie'], expectCat: 'Administration' },
      { orgs: ['unknown'], expectCat: 'Autre' },
    ]

    for (const c of cases) {
      const cra = createBaseCra({ organismes: c.orgs as unknown as any })
      const result = await transformCraV1(cra, {
        v1StructuresIdsMap,
        v1PermanencesIdsMap,
        v1ConseillersIdsMap,
      })
      expect(result.activite.structureDeRedirection).toBe(c.expectCat)
    }
  })
})
