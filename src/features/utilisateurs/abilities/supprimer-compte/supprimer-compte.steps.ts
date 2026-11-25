import assert from 'node:assert'
import { After, Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { AuteurId, UtilisateurId } from '@/features/utilisateurs/domain'
import {
  type CompteSeme,
  semerCompte,
} from '@/features/utilisateurs/utilisateurs.cucumber'
import {
  type AuteurSuppression,
  RetentionPolicy,
  type SupprimerComptePorts,
} from './domain'
import { supprimerCompte } from './domain/supprimer-compte'
import { hash } from './implementations/crypto/hash.adapter'
import { compteASupprimer } from './implementations/prisma/compte-a-supprimer.query'
import { couperAcces } from './implementations/prisma/couper-acces.mutation'
import { logEffacementReport } from './implementations/prisma/log-effacement-report.mutation'

const demandes: {
  portefeuille: string[]
  notes: (string | null)[]
  lieux: string[]
  partage: (string | null)[]
  empreinteRdv: string[]
} = { portefeuille: [], notes: [], lieux: [], partage: [], empreinteRdv: [] }

const ports: SupprimerComptePorts = {
  anonymiserPortefeuille: async ({ mediateurId }) => {
    demandes.portefeuille.push(mediateurId)
    return { anonymises: 0 }
  },
  effacerNotes: async ({ mediateurId }) => {
    demandes.notes.push(mediateurId)
    return { effacees: 0 }
  },
  effacerEmpreinteRdv: async ({ utilisateurId }) => {
    demandes.empreinteRdv.push(utilisateurId)
    return { compteDelie: false, rdvsExpurges: 0, usagersSupprimes: 0 }
  },
  retirerLesTagsDUnCompte: async () => ({ transferes: 0, supprimes: 0 }),
  detacherDesEquipes: async () => ({
    invitationsSupprimees: 0,
    appartenancesRetirees: 0,
  }),
  retirerDesLieux: async ({ mediateurId }) => {
    demandes.lieux.push(mediateurId)
    return { rattachementsSupprimes: 0 }
  },
  revoquerPartageStatistiques: async ({ mediateurId }) => {
    demandes.partage.push(mediateurId)
    return { partagesRevoques: 0 }
  },
  retirerDesListesDeDiffusion: async () => false,
  hash,
}

type Effacement = Awaited<ReturnType<ReturnType<typeof supprimerCompte>>>

const scenario: {
  compte?: CompteSeme
  effacement?: Effacement
  courrielAvantRejeu?: string
} = {}

const compteSeme = (): CompteSeme => {
  assert.ok(scenario.compte, 'Aucun compte semé')
  return scenario.compte
}

const administrateur = (): AuteurSuppression => ({
  _tag: 'administrateur',
  administrateurId: AuteurId(v4()),
})

const supprimer = async (cible: string, auteur: AuteurSuppression) => {
  scenario.effacement = await supprimerCompte({
    ...ports,
    lireLeCompteASupprimer: compteASupprimer,
    couperLAcces: couperAcces(async () => undefined),
    journaliserLEffacement: logEffacementReport,
  })({ cible: UtilisateurId(cible), auteur, maintenant: new Date() })
}

Given('un compte médiateur avec des données rattachées', async () => {
  scenario.compte = await semerCompte()
})

Given('un compte administrateur', async () => {
  scenario.compte = await semerCompte({ role: 'Admin' })
})

Given('un compte conseiller numérique sous contrat', async () => {
  scenario.compte = await semerCompte({ conseillerNumerique: true })
})

Given('le compte a déjà été supprimé', async () => {
  await prismaClient.user.update({
    where: { id: compteSeme().userId },
    data: { deleted: new Date('2026-08-01') },
  })
})

When('le titulaire supprime son compte', async () => {
  await supprimer(compteSeme().userId, { _tag: 'titulaire' })
})

When('un administrateur supprime ce compte', async () => {
  await supprimer(compteSeme().userId, administrateur())
})

When('la politique de rétention supprime ce compte', async () => {
  await supprimer(compteSeme().userId, {
    _tag: 'systeme',
    policy: RetentionPolicy('InscritJamaisActif'),
  })
})

When('un administrateur supprime un compte qui n’existe pas', async () => {
  await supprimer(v4(), administrateur())
})

When("un administrateur rejoue l'effacement de ce compte", async () => {
  scenario.courrielAvantRejeu = (
    await prismaClient.user.findUniqueOrThrow({
      where: { id: compteSeme().userId },
      select: { email: true },
    })
  ).email

  await supprimer(compteSeme().userId, administrateur())
})

Then("l'identité anonyme du compte est inchangée", async () => {
  assert.ok(scenario.courrielAvantRejeu, 'Aucun rejeu observé')

  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: compteSeme().userId },
    select: { email: true },
  })

  assert.strictEqual(utilisateur.email, scenario.courrielAvantRejeu)
})

Then("l'effacement du compte aboutit", () => {
  assert.ok(scenario.effacement?.success, "L'effacement a échoué")
})

Then(
  "l'effacement du compte échoue avec l'erreur {string}",
  (attendu: string) => {
    const { effacement } = scenario
    assert.ok(effacement && !effacement.success, "L'effacement a abouti")
    assert.strictEqual(effacement.error._tag, attendu)
  },
)

Then("l'identité du compte est anonymisée", async () => {
  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: compteSeme().userId },
    select: {
      email: true,
      name: true,
      phone: true,
      siret: true,
      deleted: true,
    },
  })

  assert.match(utilisateur.email, /^deleted\+/)
  assert.strictEqual(utilisateur.name, 'Utilisateur Supprimé')
  assert.strictEqual(utilisateur.phone, null)
  assert.strictEqual(utilisateur.siret, null)
  assert.ok(utilisateur.deleted)
})

Then("l'identité du compte est intacte", async () => {
  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: compteSeme().userId },
    select: { email: true, deleted: true },
  })

  assert.strictEqual(utilisateur.email, compteSeme().courriel)
  assert.strictEqual(utilisateur.deleted, null)
})

Then('les sessions du compte sont supprimées', async () => {
  assert.strictEqual(
    await prismaClient.session.count({
      where: { userId: compteSeme().userId },
    }),
    0,
  )
})

Then("la liaison au fournisseur d'identité est supprimée", async () => {
  assert.strictEqual(
    await prismaClient.account.count({
      where: { userId: compteSeme().userId },
    }),
    0,
  )
})

Then("le constat d'effacement est complet", () => {
  const { effacement } = scenario
  assert.ok(effacement?.success)
  assert.strictEqual(effacement.data.report._tag, 'complete')
})

Then('une reconnexion ProConnect ne retrouve plus le compte', async () => {
  assert.strictEqual(
    await prismaClient.account.count({
      where: {
        provider: 'proconnect',
        providerAccountId: `sub-${compteSeme().userId}`,
      },
    }),
    0,
  )
})

Then("l'anonymisation du portefeuille est demandée pour ce médiateur", () => {
  assert.deepStrictEqual(demandes.portefeuille, [compteSeme().mediateurId])
})

Then("l'effacement des comptes rendus est demandé pour ce médiateur", () => {
  assert.deepStrictEqual(demandes.notes, [compteSeme().mediateurId])
})

Then("le retrait des lieux d'activité est demandé pour ce médiateur", () => {
  assert.deepStrictEqual(demandes.lieux, [compteSeme().mediateurId])
})

Then(
  'la révocation du partage de statistiques est demandée pour ce médiateur',
  () => {
    assert.deepStrictEqual(demandes.partage, [compteSeme().mediateurId])
  },
)

Then("l'effacement de l'empreinte RDV est demandé pour ce compte", () => {
  assert.deepStrictEqual(demandes.empreinteRdv, [compteSeme().userId])
})

After(() => {
  demandes.portefeuille = []
  demandes.notes = []
  demandes.lieux = []
  demandes.partage = []
  demandes.empreinteRdv = []
})
