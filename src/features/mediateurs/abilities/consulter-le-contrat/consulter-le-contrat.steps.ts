import assert from 'node:assert'
import { consulterLeContrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat'
import type { Contrat } from '@app/web/features/mediateurs/abilities/consulter-le-contrat/domain'
import { UtilisateurId } from '@app/web/features/mediateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'

type CompteSeme = {
  readonly userId: string
  readonly personneId: number | null
}

const etat: { compte?: CompteSeme; contrat?: Contrat | null } = {}

const compteSeme = (): CompteSeme => {
  if (!etat.compte) throw new Error('Aucun compte semé')
  return etat.compte
}

const date = (jour: string): Date => {
  const [j, m, a] = jour.split('/').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
}

const echeances: Readonly<Record<string, string>> = {
  'en cours': 'EnCours',
  'fin prochaine': 'FinProchaine',
  terminé: 'Termine',
}

const semerUnCompte = async ({ personne }: { personne: boolean }) => {
  const userId = v4()
  await prismaClient.user.create({
    data: { id: userId, email: `contrat-${userId}@example.com` },
  })
  const fiche = personne
    ? await prismaClient.personneMain.create({
        data: { coopId: userId },
        select: { id: true },
      })
    : null
  etat.compte = { userId, personneId: fiche?.id ?? null }
}

const semerUnContrat = async (contrat: {
  type: string
  debut: string
  fin: string | null
  rupture: string | null
}) => {
  const { personneId } = compteSeme()
  if (personneId === null) throw new Error('Aucune fiche personne semée')
  await prismaClient.contratMain.create({
    data: {
      personneId,
      type: contrat.type,
      dateDebut: date(contrat.debut),
      dateFin: contrat.fin === null ? null : date(contrat.fin),
      dateRupture: contrat.rupture === null ? null : date(contrat.rupture),
    },
  })
}

const contratConsulte = (): Contrat => {
  if (!etat.contrat) throw new Error('Aucun contrat consulté')
  return etat.contrat
}

Given('un conseiller numérique', async () => {
  await semerUnCompte({ personne: true })
})

Given("un compte sans fiche dans l'Entrepôt", async () => {
  await semerUnCompte({ personne: false })
})

Given(
  /^un (CDD|CDI|CDP|PEC) du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4})(?:, rompu le (\d{2}\/\d{2}\/\d{4}))?$/,
  async (type: string, debut: string, fin: string, rupture?: string) => {
    await semerUnContrat({ type, debut, fin, rupture: rupture ?? null })
  },
)

Given(
  /^un (CDD|CDI|CDP|PEC) débuté le (\d{2}\/\d{2}\/\d{4})$/,
  async (type: string, debut: string) => {
    await semerUnContrat({ type, debut, fin: null, rupture: null })
  },
)

When(
  /^on consulte son contrat le (\d{2}\/\d{2}\/\d{4})$/,
  async (jour: string) => {
    etat.contrat = await consulterLeContrat({
      utilisateurId: UtilisateurId(compteSeme().userId),
      maintenant: date(jour),
    })
  },
)

Then(
  /^son contrat est un (\w+) du (\d{2}\/\d{2}\/\d{4}) au (\d{2}\/\d{2}\/\d{4}), (en cours|fin prochaine|terminé)$/,
  (type: string, debut: string, fin: string, echeance: string) => {
    assert.deepStrictEqual(contratConsulte(), {
      type,
      debut: date(debut),
      fin: date(fin),
      echeance: echeances[echeance],
    })
  },
)

Then(
  /^son contrat est un (\w+) débuté le (\d{2}\/\d{2}\/\d{4}), sans terme$/,
  (type: string, debut: string) => {
    assert.deepStrictEqual(contratConsulte(), {
      type,
      debut: date(debut),
      fin: null,
      echeance: 'EnCours',
    })
  },
)

Then("il n'a pas de contrat", () => {
  assert.strictEqual(etat.contrat, null)
})

After(async () => {
  const compte = etat.compte
  etat.compte = undefined
  etat.contrat = undefined
  if (!compte) return

  if (compte.personneId !== null) {
    await prismaClient.contratMain.deleteMany({
      where: { personneId: compte.personneId },
    })
    await prismaClient.personneMain.deleteMany({
      where: { id: compte.personneId },
    })
  }
  await prismaClient.user.deleteMany({ where: { id: compte.userId } })
})
