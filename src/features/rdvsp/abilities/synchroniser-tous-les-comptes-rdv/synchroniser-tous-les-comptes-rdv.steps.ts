import assert from 'node:assert'
import { Before, Given, Then, When } from '@cucumber/cucumber'
import { synchroniserTousLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/domain/synchroniser-tous-les-comptes-rdv'
import { lireLesComptesRdv } from '@/features/rdvsp/abilities/synchroniser-tous-les-comptes-rdv/implementations/prisma/comptes-rdv.query'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import {
  compteRdvEnBase,
  ID_TEST,
  seedCompteRdv,
  seedCompteRdvAutreMediateur,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'
import type { BilanDeSynchronisation } from './domain/bilan'
import type { DeclencherLaSynchronisation } from './domain/ports'

const synchroniserTousLesComptesRdvAvec = (
  declencher: DeclencherLaSynchronisation,
) =>
  synchroniserTousLesComptesRdv({
    lireLesComptes: lireLesComptesRdv,
    declencher,
  })

const COMPTE = ID_TEST.compte + 40
const AUTRE_COMPTE = ID_TEST.compte + 41
const MAINTENANT = new Date('2026-11-20T12:00:00.000Z')

const etat: {
  declenches: string[]
  enEchec: Set<string>
  bilan: BilanDeSynchronisation | undefined
} = { declenches: [], enEchec: new Set(), bilan: undefined }

const declencher: DeclencherLaSynchronisation = async ({ utilisateurId }) => {
  etat.declenches.push(utilisateurId)
  return etat.enEchec.has(utilisateurId)
    ? failure({ _tag: 'SynchronisationEchouee' })
    : success(undefined)
}

const autreUtilisateur = async (): Promise<UtilisateurCoopId> => {
  const compte = await compteRdvEnBase(AUTRE_COMPTE)
  assert.ok(compte, "L'autre compte n'a pas été semé")
  return UtilisateurCoopId(compte.userId)
}

Before(() => {
  etat.declenches = []
  etat.enEchec = new Set()
  etat.bilan = undefined
})

Given(
  'un compte RDV opérationnel parmi les comptes à synchroniser',
  async () => {
    await seedCompteRdv({ id: COMPTE, accessToken: 'jeton-acces' })
  },
)

Given(
  'un compte RDV au jeton expiré parmi les comptes à synchroniser',
  async () => {
    await seedCompteRdv({
      id: COMPTE,
      accessToken: 'jeton-acces',
      refreshToken: 'jeton-rafraichissement',
      expiresAt: new Date('2026-11-19T12:00:00.000Z'),
    })
  },
)

Given('un compte RDV déconnecté parmi les comptes à synchroniser', async () => {
  await seedCompteRdv({
    id: COMPTE,
    deleted: new Date('2026-11-01T12:00:00.000Z'),
  })
})

Given('un compte RDV en erreur parmi les comptes à synchroniser', async () => {
  await seedCompteRdv({
    id: COMPTE,
    accessToken: 'jeton-acces',
    error: 'Impossible de récupérer les données du compte RDV Service Public',
  })
})

Given(
  'un autre compte RDV opérationnel parmi les comptes à synchroniser',
  async () => {
    await seedCompteRdvAutreMediateur({ id: AUTRE_COMPTE })
  },
)

Given('la synchronisation de ce compte échoue', () => {
  etat.enEchec.add(testUtilisateurId)
})

When('je synchronise tous les comptes RDV', async () => {
  const synchronisation = await synchroniserTousLesComptesRdvAvec(declencher)({
    maintenant: MAINTENANT,
  })
  etat.bilan = synchronisation.data
})

Then('ce compte a été synchronisé', () => {
  assert.ok(etat.declenches.includes(testUtilisateurId))
})

Then("ce compte n'a pas été synchronisé", () => {
  assert.ok(!etat.declenches.includes(testUtilisateurId))
})

Then("l'autre compte a été synchronisé", async () => {
  assert.ok(etat.declenches.includes(await autreUtilisateur()))
})

Then("le bilan compte l'échec de ce compte", () => {
  assert.ok(
    etat.bilan?.echecs.some(
      ({ utilisateurId }) => utilisateurId === testUtilisateurId,
    ),
  )
})
