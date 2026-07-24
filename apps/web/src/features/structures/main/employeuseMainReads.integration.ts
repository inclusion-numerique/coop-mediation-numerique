import { getMonReseauPageData } from '@app/web/features/mon-reseau/getMonReseauPageData'
import { getStructuresEmployeusesOptions } from '@app/web/features/structures/getStructuresEmployeusesOptions'
import { prismaClient } from '@app/web/prismaClient'

// Smoke test des reads d'employeuse PUR MAIN (#1) : vérifie que la composition Prisma s'exécute
// réellement contre la base — le `Prisma.raw` (LATERAL `employeuseMainLateral`) embarqué dans un
// `$queryRaw`, et la requête d'options sur `main.structure_administrative` via affectation active.
// La logique SQL est validée par ailleurs ; ici on garantit juste « ça tourne, ça renvoie une forme ».

describe('reads employeuse pur main — smoke composition', () => {
  it('getMonReseauPageData exécute le LATERAL pur main sans erreur', async () => {
    const data = await getMonReseauPageData({ departementCode: '75' })
    expect(data).toBeDefined()
    expect(typeof data.acteursCount).toBe('number')
  })

  it('getStructuresEmployeusesOptions interroge main via affectation active', async () => {
    const mediateur = await prismaClient.mediateur.findFirst({
      select: { id: true },
    })
    const options = await getStructuresEmployeusesOptions({
      mediateurIds: mediateur ? [mediateur.id] : [],
    })
    expect(Array.isArray(options)).toBe(true)
    // Les ids d'options sont des int main stringifiés (numériques).
    for (const option of options) {
      expect(option.id).toMatch(/^\d+$/)
    }
  })
})
