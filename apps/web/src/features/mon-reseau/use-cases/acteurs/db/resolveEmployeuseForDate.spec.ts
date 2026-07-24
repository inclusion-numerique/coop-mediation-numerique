import { resolveEmployeuseForDate } from '@app/web/features/mon-reseau/use-cases/acteurs/db/getActeurEmploiForDate'

// Structure main minimale (forme `emploiStructureMainSelect`) pour les fixtures.
const structure = (id: number, nom: string) => ({
  id,
  denominationSirene: nom,
  denominationAntenne: null,
  siret: null,
  rna: null,
  contact: null,
  adresse: null,
})

const affectation = (source: string, structureId: number, nom: string) => ({
  source,
  createdAt: new Date('2026-01-01'),
  structureAdministrative: structure(structureId, nom),
})

const contrat = (
  structureId: number,
  nom: string,
  dateDebut: string,
  dateFin: string | null,
) => ({
  dateDebut: new Date(dateDebut),
  dateFin: dateFin ? new Date(dateFin) : null,
  dateRupture: null,
  structureAdministrative: structure(structureId, nom),
})

describe('resolveEmployeuseForDate', () => {
  it('renvoie null quand la personne est absente', () => {
    expect(resolveEmployeuseForDate(null, new Date('2026-06-01'))).toBeNull()
  })

  it('renvoie l’employeuse du contrat qui COUVRE la date (CN)', () => {
    const personne = {
      affectationsEmploi: [affectation('idposte', 1, 'Employeuse courante')],
      contrats: [
        contrat(10, 'Employeuse 2025', '2025-01-01', '2025-12-31'),
        contrat(11, 'Employeuse 2026', '2026-01-01', null),
      ],
    }
    // Une date de 2025 tombe sur le contrat 2025, pas sur l'affectation courante.
    expect(
      resolveEmployeuseForDate(personne, new Date('2025-06-01'))?.nom,
    ).toBe('Employeuse 2025')
    // Une date de 2026 tombe sur le contrat ouvert 2026.
    expect(
      resolveEmployeuseForDate(personne, new Date('2026-06-01'))?.nom,
    ).toBe('Employeuse 2026')
  })

  it('retombe sur l’affectation ACTIVE quand aucun contrat ne couvre la date (non-CN)', () => {
    const personne = {
      affectationsEmploi: [affectation('coop', 1, 'Employeuse courante')],
      contrats: [],
    }
    expect(
      resolveEmployeuseForDate(personne, new Date('2026-06-01'))?.nom,
    ).toBe('Employeuse courante')
  })

  it('priorise l’affectation idposte sur coop pour le fallback courant', () => {
    const personne = {
      affectationsEmploi: [
        affectation('coop', 1, 'Coop'),
        affectation('idposte', 2, 'Idposte'),
      ],
      contrats: [],
    }
    expect(
      resolveEmployeuseForDate(personne, new Date('2026-06-01'))?.nom,
    ).toBe('Idposte')
  })
})
