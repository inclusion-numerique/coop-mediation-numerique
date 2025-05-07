import { Thematique } from '@prisma/client'
import { canHavePrecisionDemarche } from './canHavePrecisionDemarche'

describe('can have precision demarche validation', () => {
  it('is invalid when precisions demarche is defined without thematique aide aux demarches administratives', () => {
    const data = {
      precisionsDemarche: 'test',
      thematiques: [],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(false)
  })

  it('is valid when precisions demarche is not defined and thematiques is empty', () => {
    const data = {
      thematiques: [],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(true)
  })

  it('is valid when precisions demarche is not defined and thematiques contains démarche non administrative', () => {
    const data = {
      thematiques: [Thematique.Bureautique],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(true)
  })

  it('is valid when precisions demarche is defined with thematique aide aux demarches administratives', () => {
    const data = {
      precisionsDemarche: 'test',
      thematiques: [Thematique.AideAuxDemarchesAdministratives],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(true)
  })

  it('is valid when precisions demarche is not defined and thematiques contains aide aux demarches administratives', () => {
    const data = {
      thematiques: [Thematique.AideAuxDemarchesAdministratives],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(true)
  })

  it('is valid when precisions demarche is an empty string and thematiques is empty', () => {
    const data = {
      precisionsDemarche: '',
      thematiques: [],
    }
    const result = canHavePrecisionDemarche(data)
    expect(result).toBe(true)
  })
})
