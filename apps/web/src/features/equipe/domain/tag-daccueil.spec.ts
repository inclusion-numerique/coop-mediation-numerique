import { NomTag } from './nom-tag'
import { tagDAccueil } from './tag-daccueil'
import { TagId } from './tag-id'

const EXISTANT = TagId('55555555-5555-4555-8555-555555555555')

const detenus = [{ id: EXISTANT, nom: NomTag('Accès aux droits') }]

describe('tag d’accueil', () => {
  // Règle qu'aucun scénario ne couvrait : sans elle, l'essaimage laisse deux
  // entrées indiscernables dans la liste du médiateur.
  it('réutilise un tag de même nom', () => {
    expect(tagDAccueil(detenus, NomTag('Accès aux droits'))).toBe(EXISTANT)
  })

  it('réutilise sans se soucier de la casse ni des espaces', () => {
    expect(tagDAccueil(detenus, NomTag('  ACCÈS AUX DROITS  '))).toBe(EXISTANT)
  })

  it('n’en réutilise aucun quand le nom diffère', () => {
    expect(tagDAccueil(detenus, NomTag('Numérique'))).toBeNull()
  })

  it('n’en réutilise aucun quand le médiateur n’en détient pas', () => {
    expect(tagDAccueil([], NomTag('Accès aux droits'))).toBeNull()
  })
})
