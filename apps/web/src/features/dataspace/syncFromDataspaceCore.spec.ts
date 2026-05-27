import type { DataspaceMediateurAdresse } from '@app/web/external-apis/dataspace/dataspaceApiClient'
import { isDataspaceAdresseComplete } from './syncFromDataspaceCore'

const completeAdresse: DataspaceMediateurAdresse = {
  nom_voie: 'Avenue de Folelli',
  code_insee: '2B207',
  repetition: null,
  code_postal: '20213',
  nom_commune: 'Penta-di-Casinca',
  numero_voie: 1,
}

describe('isDataspaceAdresseComplete', () => {
  it('returns true when voie, commune, code postal and code insee are all present', () => {
    expect(isDataspaceAdresseComplete(completeAdresse)).toBe(true)
  })

  it('returns false when nom_voie is null', () => {
    expect(
      isDataspaceAdresseComplete({ ...completeAdresse, nom_voie: null }),
    ).toBe(false)
  })

  it('returns false when nom_voie is blank', () => {
    expect(
      isDataspaceAdresseComplete({ ...completeAdresse, nom_voie: '   ' }),
    ).toBe(false)
  })

  it('returns false when code_insee is empty', () => {
    expect(
      isDataspaceAdresseComplete({ ...completeAdresse, code_insee: '' }),
    ).toBe(false)
  })

  it('returns false when code_postal is empty', () => {
    expect(
      isDataspaceAdresseComplete({ ...completeAdresse, code_postal: '' }),
    ).toBe(false)
  })

  it('returns false when nom_commune is empty', () => {
    expect(
      isDataspaceAdresseComplete({ ...completeAdresse, nom_commune: '' }),
    ).toBe(false)
  })
})
