import {
  datesDuContratLePlusRecent,
  inscritDeLaListeToDomain,
} from './inscrit-de-la-liste.transfer'

const ligne = {
  id: '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f',
  email: 'jeanne@example.com',
  firstName: null,
  lastName: null,
  phone: null,
  mediateur: null,
  coordinateur: null,
  personneMain: null,
}

describe('inscrit de la liste lu en base', () => {
  it('écarte un courriel illisible', () => {
    expect(
      inscritDeLaListeToDomain({ ...ligne, email: 'pas un courriel' }),
    ).toBeNull()
  })

  it('lit une ligne minimale sans identité ni rattachement', () => {
    expect(inscritDeLaListeToDomain(ligne)).toEqual({
      id: ligne.id,
      courriel: 'jeanne@example.com',
      prenom: null,
      nom: null,
      telephone: null,
      rattachements: { _tag: 'aucun' },
      dispositif: 'HorsDispositif',
      contrat: { fin: null, rupture: null },
    })
  })

  it('lit une ligne complète de coordinateur du dispositif', () => {
    expect(
      inscritDeLaListeToDomain({
        ...ligne,
        firstName: 'Jeanne',
        lastName: 'Martin',
        phone: '06 12 34 56 78',
        mediateur: { id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8' },
        coordinateur: { id: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f' },
        personneMain: {
          isCoordinateur: true,
          affectationsEmploi: [{ source: 'idposte', estActive: true }],
          contrats: [
            {
              id: 1,
              dateDebut: new Date('2025-01-01'),
              dateFin: new Date('2026-12-15'),
              dateRupture: null,
            },
          ],
        },
      }),
    ).toEqual({
      id: ligne.id,
      courriel: 'jeanne@example.com',
      prenom: 'Jeanne',
      nom: 'Martin',
      telephone: '+33612345678',
      rattachements: {
        _tag: 'mediateurEtCoordinateur',
        mediateur: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8',
        coordinateur: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
      },
      dispositif: 'CoordinateurDuDispositif',
      contrat: { fin: new Date('2026-12-15'), rupture: null },
    })
  })

  it('ignore une déclaration de coordinateur sans affectation idposte', () => {
    expect(
      inscritDeLaListeToDomain({
        ...ligne,
        personneMain: {
          isCoordinateur: true,
          affectationsEmploi: [],
          contrats: [],
        },
      })?.dispositif,
    ).toBe('HorsDispositif')
  })
})

const contrat = ({
  id = 1,
  debut = null,
  fin = null,
  rupture = null,
}: {
  id?: number
  debut?: string | null
  fin?: string | null
  rupture?: string | null
}) => ({
  id,
  dateDebut: debut ? new Date(debut) : null,
  dateFin: fin ? new Date(fin) : null,
  dateRupture: rupture ? new Date(rupture) : null,
})

describe('dates du contrat le plus récent', () => {
  it('sans contrat : aucune date', () => {
    expect(datesDuContratLePlusRecent([])).toEqual({ fin: null, rupture: null })
  })

  it('CDD : date de fin, sans rupture', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ debut: '2025-01-01', fin: '2026-12-15' }),
      ]),
    ).toEqual({ fin: new Date('2026-12-15'), rupture: null })
  })

  it('CDI : aucune date', () => {
    expect(
      datesDuContratLePlusRecent([contrat({ debut: '2025-01-01' })]),
    ).toEqual({ fin: null, rupture: null })
  })

  it('contrat rompu : fin et rupture séparées', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({
          debut: '2025-01-01',
          fin: '2026-12-15',
          rupture: '2026-07-10',
        }),
      ]),
    ).toEqual({ fin: new Date('2026-12-15'), rupture: new Date('2026-07-10') })
  })

  it('CDI rompu : rupture seule, sans date de fin', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ debut: '2024-01-03', rupture: '2026-06-30' }),
      ]),
    ).toEqual({ fin: null, rupture: new Date('2026-06-30') })
  })

  it('retient le contrat le plus récent par date de début', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ debut: '2023-01-01', fin: '2024-12-31' }),
        contrat({ debut: '2025-01-01', fin: '2026-12-15' }),
      ]),
    ).toEqual({ fin: new Date('2026-12-15'), rupture: null })
  })

  it('réembauche en CDI ailleurs : la rupture du poste précédent est écartée', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ id: 1, rupture: '2024-01-02' }),
        contrat({ id: 2, debut: '2024-01-03' }),
      ]),
    ).toEqual({ fin: null, rupture: null })
  })

  it('à égalité de début, la ligne qui porte une rupture gagne', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ id: 2, debut: '2025-01-01', fin: '2026-12-15' }),
        // id plus petit : seule la règle de la rupture peut la faire gagner.
        contrat({
          id: 1,
          debut: '2025-01-01',
          fin: '2026-02-01',
          rupture: '2025-06-30',
        }),
      ]),
    ).toEqual({ fin: new Date('2026-02-01'), rupture: new Date('2025-06-30') })
  })

  it('à égalité complète, l’id le plus récent départage', () => {
    expect(
      datesDuContratLePlusRecent([
        contrat({ id: 1, debut: '2025-01-01', fin: '2026-02-01' }),
        contrat({ id: 2, debut: '2025-01-01', fin: '2026-12-15' }),
      ]),
    ).toEqual({ fin: new Date('2026-12-15'), rupture: null })
  })
})
