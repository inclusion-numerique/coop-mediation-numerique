import {
  contratsToDomain,
  employeuseToDomain,
  type PersonneEmployeusePayload,
  personneToEmployeuseActuelle,
} from './employeuse.transfer'

type AffectationRow = PersonneEmployeusePayload['affectationsEmploi'][number]
type EmployeuseRow = AffectationRow['structureAdministrative']

/**
 * Ce transfer est en lecture seule : l'employeuse n'est pas écrite par cette
 * ability (les écritures arrivent avec `renseigner-employeuse`), donc pas de
 * round-trip possible. On couvre à la place les deux extrêmes de la ligne — la
 * plus complète et la plus dépouillée — puisque c'est là que les nullités de
 * `main` se transforment en états du domaine.
 */
const ligneComplete: EmployeuseRow = {
  id: 42,
  denominationSirene: 'ASSOCIATION DES TESTS',
  denominationAntenne: 'Antenne de Nantes',
  siret: '12345678901234',
  rna: 'W123456789',
  contact: { nom: 'Piaf', prenom: 'Edith', telephone: '0102030405' },
  adresse: {
    numeroVoie: 12,
    repetition: 'bis',
    nomVoie: 'rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    nomCommune: 'Nantes',
  },
}

const ligneMinimale: EmployeuseRow = {
  id: 43,
  denominationSirene: null,
  denominationAntenne: null,
  siret: null,
  rna: null,
  contact: null,
  adresse: null,
}

describe('employeuseToDomain', () => {
  it('valide et brande une ligne complète', () => {
    expect(employeuseToDomain(ligneComplete)).toEqual({
      id: 42,
      denomination: 'Antenne de Nantes',
      siret: '12345678901234',
      rna: 'W123456789',
      adresse: {
        voie: '12 bis rue des Tests',
        codePostal: '44000',
        codeInsee: '44109',
        commune: 'Nantes',
      },
      contactReferent: {
        _tag: 'renseigne',
        nom: 'Piaf Edith',
        courriel: null,
        telephone: '0102030405',
      },
    })
  })

  it('rend explicites les absences d’une ligne minimale', () => {
    expect(employeuseToDomain(ligneMinimale)).toEqual({
      id: 43,
      denomination: null,
      siret: null,
      rna: null,
      adresse: null,
      contactReferent: { _tag: 'nonRenseigne' },
    })
  })

  it('préfère la dénomination d’antenne, sinon celle de SIRENE', () => {
    expect(
      employeuseToDomain({ ...ligneComplete, denominationAntenne: null })
        .denomination,
    ).toBe('ASSOCIATION DES TESTS')
  })

  // La donnée de `main` est produite par d'autres : un SIRET illisible ne doit
  // pas faire échouer la lecture de toute l'employeuse.
  it('écarte un SIRET hors format sans perdre le reste', () => {
    const employeuse = employeuseToDomain({
      ...ligneComplete,
      siret: 'siret-invalide',
    })
    expect(employeuse.siret).toBeNull()
    expect(employeuse.denomination).toBe('Antenne de Nantes')
  })
})

describe('contratsToDomain', () => {
  // Deux contrats successifs chez le même employeur restent deux périodes : c'est
  // ce qui permet de savoir laquelle couvre une date passée.
  it('conserve chaque contrat, y compris chez la même employeuse', () => {
    const contrats = contratsToDomain([
      {
        structureAdministrative: ligneComplete,
        dateDebut: new Date('2024-01-01'),
        dateFin: new Date('2024-12-31'),
        dateRupture: null,
      },
      {
        structureAdministrative: ligneComplete,
        dateDebut: new Date('2026-01-01'),
        dateFin: null,
        dateRupture: null,
      },
    ])

    expect(contrats.map(({ periode }) => periode)).toEqual([
      {
        _tag: 'terminee',
        debut: new Date('2024-01-01'),
        fin: new Date('2024-12-31'),
      },
      { _tag: 'enCours', debut: new Date('2026-01-01') },
    ])
    expect(contrats.every(({ employeuse }) => employeuse.id === 42)).toBe(true)
  })

  it('écarte les contrats sans structure', () => {
    expect(
      contratsToDomain([
        {
          structureAdministrative: null,
          dateDebut: new Date('2026-01-01'),
          dateFin: null,
          dateRupture: null,
        },
      ]),
    ).toEqual([])
  })
})

describe('personneToEmployeuseActuelle', () => {
  it('compose la personne chargée en employeuse courante', () => {
    const actuelle = personneToEmployeuseActuelle({
      affectationsEmploi: [
        {
          source: 'coop',
          createdAt: new Date('2026-01-01'),
          structureAdministrative: ligneComplete,
        },
      ],
      contrats: [
        {
          structureAdministrative: ligneComplete,
          dateDebut: new Date('2026-03-01'),
          dateFin: null,
          dateRupture: null,
        },
      ],
    })

    expect(actuelle?.employeuse.id).toBe(42)
    expect(actuelle?.source).toBe('coop')
    expect(actuelle?.periode).toEqual({
      _tag: 'enCours',
      debut: new Date('2026-03-01'),
    })
  })

  it('n’a pas d’employeuse sans personne', () => {
    expect(personneToEmployeuseActuelle(null)).toBeNull()
  })
})
