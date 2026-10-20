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
        derniereModification: avantLaRupture,
        maintenant,
      }),
    ).toBeNull()
  })

  it('n’existe pas pour un contrat en cours', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01' })],
        derniereModification: avantLaRupture,
        maintenant,
      }),
    ).toBeNull()
  })

  it('attend une réponse quand la rupture est passée et postérieure à la dernière modification', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        derniereModification: avantLaRupture,
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })

  it('n’existe plus une fois la visibilité réglée après la rupture', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-09-01' })],
        derniereModification: apresLaRupture,
        maintenant,
      }),
    ).toBeNull()
  })

  it('n’existe pas tant que la rupture est à venir', () => {
    expect(
      ruptureEnAttente({
        contrats: [contrat({ debut: '2025-01-01', rupture: '2026-11-01' })],
        derniereModification: avantLaRupture,
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
        derniereModification: avantLaRupture,
        maintenant,
      }),
    ).toBeNull()
  })

  it('retient la rupture du contrat le plus récent', () => {
    expect(
      ruptureEnAttente({
        contrats: [
          contrat({ debut: '2024-01-01', rupture: '2025-06-01' }),
          contrat({ debut: '2025-07-01', rupture: '2026-09-01' }),
        ],
        derniereModification: new Date('2025-08-01T10:00:00.000Z'),
        maintenant,
      }),
    ).toEqual({ dateRupture: new Date('2026-09-01') })
  })
})
