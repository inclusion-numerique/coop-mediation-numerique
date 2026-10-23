import { getStructuresEmployeusesOptions } from '@app/web/features/employeuse/getStructuresEmployeusesOptions'
import { consulterLeReseauDuDepartement } from '@app/web/features/mon-reseau/abilities/consulter-le-reseau-du-departement'
import { consulterLesActeursDuDepartement } from '@app/web/features/mon-reseau/abilities/lister-les-acteurs-du-departement'
import { prismaClient } from '@app/web/prismaClient'

/**
 * Le port SQL ne se vérifie qu'à l'exécution : un fragment mal composé passe le
 * compilateur et échoue en base. Chaque requête qui l'embarque est donc exercée
 * ici — y compris les requêtes de comptage, dont l'oubli avait déjà produit une
 * divergence silencieuse entre la liste et son total (`7e8a3e40`).
 */
describe('port SQL employeuse — composition contre la base', () => {
  it('le comptage de mon-réseau joint l’employeuse courante', async () => {
    const reseau = await consulterLeReseauDuDepartement('75')

    expect(reseau.success && typeof reseau.data.acteurs).toBe('number')
  })

  it('la recherche d’acteurs joint l’employeuse courante, liste et total', async () => {
    const consultation = await consulterLesActeursDuDepartement('75', {})

    if (!consultation.success) throw new Error('Département inconnu')
    expect(consultation.data.acteurs.acteurs.length).toBeLessThanOrEqual(
      consultation.data.acteurs.total,
    )
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
