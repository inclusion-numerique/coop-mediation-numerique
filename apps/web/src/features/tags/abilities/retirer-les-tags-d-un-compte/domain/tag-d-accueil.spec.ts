import { NomDuTag, TagId } from '../../../domain'
import { tagDAccueil } from './tag-d-accueil'

const EXISTANT = TagId('55555555-5555-4555-8555-555555555555')

const detenus = [{ id: EXISTANT, nom: NomDuTag('Accès aux droits') }]

describe('tag d’accueil', () => {
  it('réutilise un tag de même nom', () => {
    expect(tagDAccueil(detenus, NomDuTag('Accès aux droits'))).toBe(EXISTANT)
  })

  it('réutilise sans se soucier de la casse ni des espaces', () => {
    expect(tagDAccueil(detenus, NomDuTag('  ACCÈS AUX DROITS  '))).toBe(
      EXISTANT,
    )
  })

  it('n’en réutilise aucun quand le nom diffère', () => {
    expect(tagDAccueil(detenus, NomDuTag('Numérique'))).toBeNull()
  })

  it('n’en réutilise aucun quand le médiateur n’en détient pas', () => {
    expect(tagDAccueil([], NomDuTag('Accès aux droits'))).toBeNull()
  })
})
