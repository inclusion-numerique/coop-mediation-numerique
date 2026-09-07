import { getStructuresEmployeusesOptions } from '@app/web/features/employeuse/getStructuresEmployeusesOptions'
import { getMonReseauPageData } from '@app/web/features/mon-reseau/getMonReseauPageData'
import { searchActeurs } from '@app/web/features/mon-reseau/use-cases/acteurs/db/searchActeurs'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Le port SQL ne se vérifie qu'à l'exécution : un fragment mal composé passe le
 * compilateur et échoue en base. Chaque requête qui l'embarque est donc exercée
 * ici — y compris les requêtes de comptage, dont l'oubli avait déjà produit une
 * divergence silencieuse entre la liste et son total (`7e8a3e40`).
 */
describe('port SQL employeuse — composition contre la base', () => {
  it('le comptage de mon-réseau joint l’employeuse courante', async () => {
    const data = await getMonReseauPageData({ departementCode: '75' })

    expect(typeof data.acteursCount).toBe('number')
  })

  it('la recherche d’acteurs joint l’employeuse courante, liste et total', async () => {
    const resultat = await searchActeurs({
      departementCode: '75',
      searchParams: {},
    })

    expect(Array.isArray(resultat.acteurs)).toBe(true)
    expect(typeof resultat.totalCount).toBe('number')
    // Liste et total sortent de deux requêtes distinctes : elles doivent voir la
    // même population, donc porter la même jointure.
    expect(resultat.acteurs.length).toBeLessThanOrEqual(resultat.totalCount)
  })

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
