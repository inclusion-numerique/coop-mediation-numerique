import { getStructuresEmployeusesOptions } from '@app/web/features/activites/use-cases/list/db/getStructuresEmployeusesOptions'
import { prismaClient } from '@app/web/prismaClient'

describe('getStructuresEmployeusesOptions', () => {
  it('les options de filtre employeuse portent des identifiants main', async () => {
    const mediateur = await prismaClient.mediateur.findFirst({
      select: { id: true },
    })
    const options = await getStructuresEmployeusesOptions({
      mediateurIds: mediateur ? [mediateur.id] : [],
    })

    expect(Array.isArray(options)).toBe(true)
    for (const option of options) {
      expect(option.id).toMatch(/^\d+$/)
    }
  })
})
