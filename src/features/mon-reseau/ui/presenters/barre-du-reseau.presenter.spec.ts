import { describe, expect, it } from 'vitest'
import { filtresDesActeursDuReseau } from '../../abilities/lister-les-acteurs-du-departement/ui/filtres/acteurs-du-reseau.filtre'
import { barreDuReseau } from './barre-du-reseau.presenter'

const AURILLAC = { value: '15014', label: 'Aurillac · 15000' }
const SAINT_FLOUR = { value: '15187', label: 'Saint-Flour · 15100' }

const barre = (parametres: Record<string, string>) =>
  barreDuReseau({
    filtres: filtresDesActeursDuReseau,
    adresse: { chemin: '/coop/mon-reseau/15/acteurs', parametres },
    communes: [AURILLAC, SAINT_FLOUR],
  })

describe('barre de filtres du réseau', () => {
  it('nomme le rôle et les communes retenus', () => {
    expect(
      barre({ role: 'coordinateur', communes: '15014', page: '2' }).etiquettes,
    ).toEqual([
      {
        titre: 'Communes',
        prefixe: 'Commune : ',
        libelle: 'Aurillac · 15000',
        href: '/coop/mon-reseau/15/acteurs?role=coordinateur',
      },
      {
        titre: 'Rôle',
        prefixe: '',
        libelle: 'Coordinateur',
        href: '/coop/mon-reseau/15/acteurs?communes=15014',
      },
    ])
  })

  it('retrouve le libellé des communes choisies', () => {
    expect(barre({ communes: '15187' }).communes.choisies).toEqual([
      SAINT_FLOUR,
    ])
  })

  it('limite les suggestions à dix communes', () => {
    expect(
      barreDuReseau({
        filtres: filtresDesActeursDuReseau,
        adresse: { chemin: '/coop/mon-reseau/15/acteurs', parametres: {} },
        communes: Array.from({ length: 12 }, (_, rang) => ({
          value: `150${10 + rang}`,
          label: `Commune ${rang}`,
        })),
      }).communes.suggestions,
    ).toHaveLength(10)
  })

  it('retire tous les filtres', () => {
    expect(barre({ role: 'coordinateur', tri: 'nomza' }).sansFiltres).toBe(
      '/coop/mon-reseau/15/acteurs?tri=nomza',
    )
  })
})
