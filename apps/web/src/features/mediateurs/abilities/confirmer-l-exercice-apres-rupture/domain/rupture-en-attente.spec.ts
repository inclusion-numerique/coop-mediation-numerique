import { etatContrat, ruptureEnAttente } from './rupture-en-attente'

const maintenant = new Date('2026-10-20T09:00:00.000Z')
const avantLaRupture = new Date('2026-08-15T10:00:00.000Z')
const apresLaRupture = new Date('2026-09-15T10:00:00.000Z')

const contrat = ({
  debut,
  rupture = null,
}: {
  debut: string
  rupture?: string | null
}) => ({
  debut: new Date(debut),
  etat: etatContrat(rupture == null ? null : new Date(rupture)),
})

describe('rupture en attente', () => {
  it('n’existe pas sans contrat', () => {
    expect(
      ruptureEnAttente({
        contrats: [],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toBeNull()
  })

  it('n’existe pas pour un contrat en cours', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01' })],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toBeNull()
  })

  it('attend une réponse quand la rupture est passée et la visibilité réglée avant elle', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        visibiliteChoisieLe: avantLaRupture,
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })

  it('attend une réponse quand la visibilité n’a jamais été réglée', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })

  it('n’existe plus une fois la visibilité réglée après la rupture', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        visibiliteChoisieLe: apresLaRupture,
        maintenant,
      }),
    ).toBeNull()
  })

  it('tient pour postérieur un choix fait le jour de la rupture, heure de Paris', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        visibiliteChoisieLe: new Date('2026-08-31T22:30:00.000Z'),
        maintenant,
      }),
    ).toBeNull()
  })

  it('tient pour antérieur un choix fait la veille de la rupture, heure de Paris', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        visibiliteChoisieLe: new Date('2026-08-31T21:30:00.000Z'),
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })

  it('tient la rupture pour passée dès minuit, heure de Paris', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-10-21' })],
        visibiliteChoisieLe: null,
        maintenant: new Date('2026-10-20T22:30:00.000Z'),
      }),
    ).toEqual({ dateRupture: new Date('2026-10-21') })
  })

  it('n’existe pas tant que la rupture est à venir', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-11-01' })],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toBeNull()
  })

  it('ignore la rupture d’un ancien contrat quand la personne a été réembauchée', () => {
    expect(
      ruptureEnAttente({
        contrats: [
          contrat({ debut: '2024-01-01', rupture: '2026-09-01' }),
          contrat({ debut: '2026-09-10' }),
        ],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toBeNull()
  })

  it('attend une réponse tant qu’un nouveau contrat n’a pas commencé', () => {
    expect(
      ruptureEnAttente({
        contrats: [
          contrat({ debut: '2024-01-01', rupture: '2026-09-01' }),
          contrat({ debut: '2026-12-01' }),
        ],
        visibiliteChoisieLe: null,
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })

  it('retient la dernière rupture passée', () => {
    expect(
      ruptureEnAttente({
        contrats: [
          contrat({ debut: '2024-01-01', rupture: '2025-06-01' }),
          contrat({ debut: '2025-07-01', rupture: '2026-09-01' }),
        ],
        visibiliteChoisieLe: new Date('2025-08-01T10:00:00.000Z'),
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })
})
