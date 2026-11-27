import { describe, expect, it } from 'vitest'
import { classeurDesCoordinations } from './classeur-des-coordinations.classeur'

const genereLe = new Date('2026-03-10T09:00:00.000Z')

describe('classeur des activités de coordination', () => {
  it('date le classeur de l’instant de sa génération', () => {
    expect(
      classeurDesCoordinations({
        entetes: ['Type'],
        lignes: [['Animation']],
        filtres: [['Période', 'Toutes']],
        auteur: {
          prenom: 'Ada',
          nom: 'Lovelace',
          role: 'Médiateur',
        },
        fuseau: 'Europe/Paris',
        genereLe,
      }).created,
    ).toEqual(genereLe)
  })
})
