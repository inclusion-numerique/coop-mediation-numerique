import assert from 'node:assert'
import type { ConsulterRdvsAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/domain/consulter-rdvs-accueil'
import { consulterRdvsAccueil } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/consulter-rdvs-accueil'
import { compteDuMediateur } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/compte-du-mediateur.query'
import { lireDonneesAccueilRdv } from '@app/web/features/rdvsp/abilities/consulter-rdvs-accueil/implementation/prisma/donnees-accueil-rdv.query'
import { StatutPresence } from '@app/web/features/rdvsp/domain/statut-presence'
import {
  ID_TEST,
  seedCompteRdv,
  seedRdv,
  testUtilisateurId,
} from '@app/web/features/rdvsp/rdvsp.cucumber'
import { Given, Then, When } from '@cucumber/cucumber'

const AGENT_ID = ID_TEST.compte + 9
const MAINTENANT = new Date('2026-08-17T12:00:00.000Z')

const JOUR_EN_MS = 24 * 60 * 60 * 1000

let rdvsCrees = 0
let resultat: Awaited<ReturnType<ConsulterRdvsAccueil>> | undefined

const consulter = consulterRdvsAccueil({
  compteDuMediateur,
  lireDonnees: lireDonneesAccueilRdv,
})

const dans = (jours: number) =>
  new Date(MAINTENANT.getTime() + jours * JOUR_EN_MS)

const creerRdv = async ({
  statut,
  debut,
  craDeclined = false,
}: {
  statut: string
  debut: Date
  craDeclined?: boolean
}) => {
  rdvsCrees += 1
  await seedRdv({
    id: ID_TEST.rdv + 200 + rdvsCrees,
    rdvAccountId: AGENT_ID,
    organisationId: ID_TEST.organisation + 200,
    status: StatutPresence.schema.parse(statut),
    craDeclined,
    debut,
  })
}

Given('un compte RDV consultable', async () => {
  rdvsCrees = 0
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('un compte RDV en erreur à consulter', async () => {
  rdvsCrees = 0
  await seedCompteRdv({
    id: AGENT_ID,
    accessToken: 'jeton-acces',
    error: 'invalid_grant',
  })
})

Given('un compte RDV délié à consulter', async () => {
  rdvsCrees = 0
  await seedCompteRdv({
    id: AGENT_ID,
    deleted: new Date('2026-07-08T00:00:00.000Z'),
  })
})

Given('aucun compte RDV à consulter', () => {
  rdvsCrees = 0
})

Given(
  'un rendez-vous {string} dans {int} jours',
  async (statut: string, jours: number) => {
    await creerRdv({ statut, debut: dans(jours) })
  },
)

Given(
  'un rendez-vous {string} il y a {int} jours',
  async (statut: string, jours: number) => {
    await creerRdv({ statut, debut: dans(-jours) })
  },
)

Given(
  'un rendez-vous {string} il y a {int} jours dont le CRA a été écarté',
  async (statut: string, jours: number) => {
    await creerRdv({ statut, debut: dans(-jours), craDeclined: true })
  },
)

When('je consulte l’accueil', async () => {
  resultat = await consulter({
    utilisateurId: testUtilisateurId,
    maintenant: MAINTENANT,
  })
})

const donnees = () => {
  assert.ok(resultat, 'Aucune consultation effectuée')
  assert.strictEqual(
    resultat._tag,
    'donnees',
    `L’accueil devrait afficher des données, il affiche « ${resultat._tag} »`,
  )
  return resultat._tag === 'donnees' ? resultat.donnees : undefined
}

Then('l’accueil annonce {int} rendez-vous à venir', (nombre: number) => {
  assert.strictEqual(donnees()?.aVenir, nombre)
})

Then('l’accueil annonce {int} rendez-vous passé', (nombre: number) => {
  const accueil = donnees()
  assert.strictEqual((accueil?.passes ?? 0) + (accueil?.honores ?? 0), nombre)
})

Then(
  'le prochain rendez-vous mis en avant commence dans {int} jours',
  (jours: number) => {
    assert.deepStrictEqual(donnees()?.prochain?.debut, dans(jours))
  },
)

Then('l’accueil affiche une alerte', () => {
  assert.strictEqual(resultat?._tag, 'alerte')
})

Then('l’accueil masque le bloc rendez-vous', () => {
  assert.strictEqual(resultat?._tag, 'masque')
})
