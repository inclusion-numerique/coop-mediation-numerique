import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import {
  type CompteSeme,
  semerCompte,
} from '@/features/utilisateurs/utilisateurs.cucumber'
import { apercevoirLaFusionDesComptes } from './domain/apercevoir-la-fusion-des-comptes'
import { lireLesComptesAApercevoir } from './implementations/prisma/comptes-a-apercevoir.query'

const apercevoir = apercevoirLaFusionDesComptes({ lireLesComptesAApercevoir })

type Apercu = Awaited<ReturnType<typeof apercevoir>>

const etat: {
  source?: CompteSeme
  cible?: CompteSeme
  apercu?: Apercu
} = {}

const cible = (): CompteSeme => {
  assert.ok(etat.cible, 'Aucune cible semée')
  return etat.cible
}

const source = (): CompteSeme => {
  assert.ok(etat.source, 'Aucune source semée')
  return etat.source
}

const apercuReussi = () => {
  assert.ok(etat.apercu?.success, "L'aperçu a échoué")
  return etat.apercu.data
}

Given('deux comptes dont la fusion est à apercevoir', async () => {
  etat.source = await semerCompte()
  etat.cible = await semerCompte()
})

When(
  "l'administration aperçoit la fusion de la source dans la cible",
  async () => {
    etat.apercu = await apercevoir({
      sourceId: UtilisateurId(source().userId),
      cibleId: UtilisateurId(cible().userId),
    })
  },
)

When(
  "l'administration aperçoit la fusion d'un compte inexistant dans la cible",
  async () => {
    etat.apercu = await apercevoir({
      sourceId: UtilisateurId(v4()),
      cibleId: UtilisateurId(cible().userId),
    })
  },
)

Then("l'aperçu montre le bénéficiaire et l'activité de la source", () => {
  const { contenu } = apercuReussi().source
  assert.deepStrictEqual(
    [contenu.beneficiaires, contenu.activites],
    [[source().beneficiaireId], [source().activiteId]],
  )
})

Then("l'aperçu ne relève rien en commun aux deux comptes", () => {
  assert.deepStrictEqual(Object.values(apercuReussi().communs).flat(), [])
})

Then(
  "l'aperçu de la fusion échoue avec l'erreur {string}",
  (attendu: string) => {
    const { apercu } = etat
    assert.ok(apercu && !apercu.success, "L'aperçu a abouti")
    assert.strictEqual(apercu.error._tag, attendu)
  },
)
