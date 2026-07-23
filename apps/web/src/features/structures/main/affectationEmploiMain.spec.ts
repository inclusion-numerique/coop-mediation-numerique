import {
  type PersonneEmployeusePayload,
  pickAffectationActuelle,
  pickContratForStructure,
  resolveEmployeuseActuelle,
} from '@app/web/features/structures/main/affectationEmploiMain'

type Affectation = PersonneEmployeusePayload['affectationsEmploi'][number]
type Contrat = PersonneEmployeusePayload['contrats'][number]

const structure = (
  id: number,
  overrides: Partial<Affectation['structureAdministrative']> = {},
): Affectation['structureAdministrative'] => ({
  id,
  structureCoopId: `coop-${id}`,
  denominationSirene: `Sirene ${id}`,
  denominationAntenne: null,
  siret: `siret-${id}`,
  rna: null,
  contact: null,
  adresse: {
    numeroVoie: 12,
    repetition: null,
    nomVoie: 'rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    nomCommune: 'Nantes',
  },
  ...overrides,
})

const affectation = (
  source: string,
  structureId: number,
  createdAt: Date | null = new Date('2026-01-01'),
): Affectation => ({
  source,
  createdAt,
  structureAdministrative: structure(structureId),
})

const contrat = (
  structureId: number | null,
  dateDebut: Date | null,
  dateFin: Date | null = null,
  dateRupture: Date | null = null,
): Contrat => ({ structureId, dateDebut, dateFin, dateRupture })

describe('pickAffectationActuelle', () => {
  it('priorise idposte sur coop', () => {
    const result = pickAffectationActuelle([
      affectation('coop', 1),
      affectation('idposte', 2),
    ])
    expect(result?.structureAdministrative.id).toBe(2)
  })

  it('retombe sur coop quand il n’y a pas d’idposte', () => {
    const result = pickAffectationActuelle([
      affectation('aidants-connect', 3),
      affectation('coop', 1),
    ])
    expect(result?.structureAdministrative.id).toBe(1)
  })

  it('à source égale, prend la plus récemment créée', () => {
    const result = pickAffectationActuelle([
      affectation('coop', 1, new Date('2025-01-01')),
      affectation('coop', 2, new Date('2026-06-01')),
    ])
    expect(result?.structureAdministrative.id).toBe(2)
  })

  it('retourne null sans affectation', () => {
    expect(pickAffectationActuelle([])).toBeNull()
  })
})

describe('pickContratForStructure', () => {
  it('sélectionne le contrat de la structure, date de début la plus récente', () => {
    const result = pickContratForStructure(
      [
        contrat(1, new Date('2024-01-01')),
        contrat(1, new Date('2026-01-01')),
        contrat(2, new Date('2027-01-01')),
      ],
      1,
    )
    expect(result?.dateDebut).toEqual(new Date('2026-01-01'))
  })

  it('retourne null si aucun contrat ne cible la structure', () => {
    expect(pickContratForStructure([contrat(2, new Date())], 1)).toBeNull()
  })
})

describe('resolveEmployeuseActuelle', () => {
  it('mappe l’employeuse prioritaire + dates best-effort du contrat', () => {
    const personne: PersonneEmployeusePayload = {
      affectationsEmploi: [affectation('coop', 1), affectation('idposte', 2)],
      contrats: [contrat(2, new Date('2026-03-01'), new Date('2026-09-01'))],
    }

    const result = resolveEmployeuseActuelle(personne)

    expect(result).toMatchObject({
      structureMainId: 2,
      structureCoopId: 'coop-2',
      source: 'idposte',
      nom: 'Sirene 2',
      adresse: '12 rue des Tests',
      commune: 'Nantes',
      codePostal: '44000',
      codeInsee: '44109',
      siret: 'siret-2',
      debut: new Date('2026-03-01'),
      fin: new Date('2026-09-01'),
    })
  })

  it('sans contrat, dates nulles (best-effort)', () => {
    const personne: PersonneEmployeusePayload = {
      affectationsEmploi: [affectation('coop', 1)],
      contrats: [],
    }
    const result = resolveEmployeuseActuelle(personne)
    expect(result?.debut).toBeNull()
    expect(result?.fin).toBeNull()
    expect(result?.structureMainId).toBe(1)
  })

  it('retourne null sans personne ni affectation', () => {
    expect(resolveEmployeuseActuelle(null)).toBeNull()
    expect(
      resolveEmployeuseActuelle({ affectationsEmploi: [], contrats: [] }),
    ).toBeNull()
  })
})
