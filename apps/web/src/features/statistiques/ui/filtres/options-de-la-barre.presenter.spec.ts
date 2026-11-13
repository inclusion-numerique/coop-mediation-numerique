import { optionsDesStatistiques } from './options-de-la-barre.presenter'
import { activiteSourceOptions } from './source'

const fournisseurs = {
  lieuxChoisis: async () => ({
    communesOptions: [{ label: 'Lyon · 69001', value: '69381' }],
    departementsOptions: [],
    lieuxActiviteOptions: [],
  }),
  tags: async () => [
    { id: 't1', nom: 'Atelier', portee: { _tag: 'Equipe' as const } },
  ],
  beneficiaires: async () => [],
  membres: async () => [
    {
      mediateurId: 'm1',
      nom: 'Alan Turing',
      email: 'alan@example.com',
      situation: 'Demandeur' as const,
    },
    {
      mediateurId: 'm2',
      nom: 'Ada Lovelace',
      email: 'ada@example.com',
      situation: 'Membre' as const,
    },
    {
      mediateurId: 'm3',
      nom: 'Grace Hopper',
      email: 'grace@example.com',
      situation: 'AncienMembre' as const,
    },
  ],
  activitesDuPerimetre: async () => ({
    employeuses: [{ id: 42, nom: 'Mairie de Lyon', commune: 'Lyon' }],
    premiere: '2025-01-15',
    derniere: '2026-03-10',
  }),
}

describe('options des statistiques', () => {
  it('libelle les membres comme la barre les affiche', async () => {
    const options = await optionsDesStatistiques(fournisseurs)
    expect(options.initialMediateursOptions.map(({ label }) => label)).toEqual([
      'Alan Turing (Mes statistiques)',
      'Ada Lovelace',
      'Ancien membre - Grace Hopper',
    ])
  })

  it('reprend la portée des tags et les employeuses', async () => {
    const options = await optionsDesStatistiques(fournisseurs)
    expect(options.tagsOptions).toEqual([
      { id: 't1', nom: 'Atelier', scope: 'd’équipe' },
    ])
    expect(options.structuresEmployeusesOptions).toEqual([
      { id: '42', nom: 'Mairie de Lyon', commune: 'Lyon' },
    ])
  })

  it('fournit toujours les sources pour nommer celle choisie', async () => {
    const options = await optionsDesStatistiques(fournisseurs)
    expect(options.activiteSourceOptions).toEqual(activiteSourceOptions)
  })

  it('borne les dates à la première activité', async () => {
    const options = await optionsDesStatistiques(fournisseurs)
    expect(options.activiteDates.first).toEqual(new Date('2025-01-15'))
  })
})
