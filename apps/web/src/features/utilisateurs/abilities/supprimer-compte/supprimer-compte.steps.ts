import assert from 'node:assert'
import { effacerNotes } from '@app/web/features/activites/abilities/effacer-notes'
import { anonymiserPortefeuille } from '@app/web/features/beneficiaire/abilities/anonymiser-portefeuille'
import { detacherDesEquipes } from '@app/web/features/equipe'
import { retirerDesLieux } from '@app/web/features/lieux-activite'
import { revoquerPartageStatistiques } from '@app/web/features/mediateurs/abilities/revoquer-partage-statistiques'
import { effacerEmpreinteRdv } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import {
  AuteurId,
  identifiantsDe,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import {
  type CompteSeme,
  semerCompte,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { supprimerCompte } from './commands/supprimer-compte'
import type { SupprimerComptePorts } from './domain'
import { hash } from './implementation'

/**
 * Le scénario compose lui-même les étapes, comme le fait la couche
 * application : la feature `utilisateurs` ne connaît toujours aucune des
 * features qui exécutent. Seules les listes de diffusion sont remplacées — un
 * test d'intégration n'appelle pas Brevo, et s'abstenir est un succès sans
 * effet.
 */
const ports: SupprimerComptePorts = {
  anonymiserPortefeuille,
  effacerEmpreinteRdv,
  retirerDesLieux,

  effacerNotes: ({ rattachements }) =>
    effacerNotes(identifiantsDe(rattachements)),

  detacherDesEquipes: ({ rattachements }) =>
    detacherDesEquipes(identifiantsDe(rattachements)),

  revoquerPartageStatistiques: ({ rattachements }) =>
    revoquerPartageStatistiques(identifiantsDe(rattachements)),

  retirerDesListesDeDiffusion: async () => false,
  hash,
}

type Effacement = Awaited<ReturnType<typeof supprimerCompte>>

let compte: CompteSeme | undefined
let effacement: Effacement | undefined
let courrielAvantRejeu: string | undefined

Given('un compte médiateur avec des données rattachées', async () => {
  compte = await semerCompte()
})

Given('un compte administrateur', async () => {
  compte = await semerCompte({ role: 'Admin' })
})

Given('le compte a déjà été supprimé', async () => {
  assert.ok(compte)
  await prismaClient.user.update({
    where: { id: compte.userId },
    data: { deleted: new Date('2026-08-01') },
  })
})

When('le titulaire supprime son compte', async () => {
  assert.ok(compte)
  effacement = await supprimerCompte({
    command: {
      cible: UtilisateurId(compte.userId),
      auteur: { _tag: 'titulaire' },
      maintenant: new Date(),
    },
    ports,
  })
})

When('un administrateur supprime ce compte', async () => {
  assert.ok(compte)
  effacement = await supprimerCompte({
    command: {
      cible: UtilisateurId(compte.userId),
      auteur: { _tag: 'administrateur', administrateurId: AuteurId(v4()) },
      maintenant: new Date(),
    },
    ports,
  })
})

When("un administrateur rejoue l'effacement de ce compte", async () => {
  assert.ok(compte)
  courrielAvantRejeu = (
    await prismaClient.user.findUniqueOrThrow({
      where: { id: compte.userId },
      select: { email: true },
    })
  ).email

  effacement = await supprimerCompte({
    command: {
      cible: UtilisateurId(compte.userId),
      auteur: { _tag: 'administrateur', administrateurId: AuteurId(v4()) },
      maintenant: new Date(),
    },
    ports,
  })
})

Then("l'identité anonyme du compte est inchangée", async () => {
  assert.ok(compte)
  assert.ok(courrielAvantRejeu, 'Aucun rejeu observé')

  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: compte.userId },
    select: { email: true },
  })

  assert.strictEqual(utilisateur.email, courrielAvantRejeu)
})

Then("l'effacement du compte aboutit", () => {
  assert.ok(effacement?.success, "L'effacement a échoué")
})

Then(
  "l'effacement du compte échoue avec l'erreur {string}",
  (attendu: string) => {
    assert.ok(effacement && !effacement.success, "L'effacement a abouti")
    assert.strictEqual(effacement.error._tag, attendu)
  },
)

Then("l'identité du compte est anonymisée", async () => {
  assert.ok(compte)
  const utilisateur = await prismaClient.user.findUniqueOrThrow({
    where: { id: compte.userId },
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

Then('les sessions du compte sont supprimées', async () => {
  assert.ok(compte)
  assert.strictEqual(
    await prismaClient.session.count({ where: { userId: compte.userId } }),
    0,
  )
})

Then('les jetons du compte sont révoqués', async () => {
  assert.ok(compte)
  const liaison = await prismaClient.account.findFirstOrThrow({
    where: { userId: compte.userId },
  })

  assert.strictEqual(liaison.access_token, null)
  assert.strictEqual(liaison.refresh_token, null)
  assert.strictEqual(liaison.id_token, null)
  assert.strictEqual(liaison.expires_at, null)
  assert.strictEqual(liaison.session_state, null)
})

Then("le constat d'effacement est complet", () => {
  assert.ok(effacement?.success)
  assert.strictEqual(effacement.data.report._tag, 'complete')
})

Then("la liaison au fournisseur d'identité existe toujours", async () => {
  assert.ok(compte)
  assert.strictEqual(
    await prismaClient.account.count({ where: { userId: compte.userId } }),
    1,
  )
})

Then("la liaison au fournisseur d'identité a conservé sa clé", async () => {
  assert.ok(compte)
  const liaison = await prismaClient.account.findFirstOrThrow({
    where: { userId: compte.userId },
  })

  assert.strictEqual(liaison.provider, 'proconnect')
  assert.strictEqual(liaison.providerAccountId, `sub-${compte.userId}`)
})

Then('le portefeuille de bénéficiaires est anonymisé', async () => {
  assert.ok(compte)
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: compte.beneficiaireId },
    select: {
      prenom: true,
      nom: true,
      telephone: true,
      email: true,
      notes: true,
      anonyme: true,
      suppression: true,
      anneeNaissance: true,
    },
  })

  assert.strictEqual(beneficiaire.prenom, null)
  assert.strictEqual(beneficiaire.nom, null)
  assert.strictEqual(beneficiaire.telephone, null)
  assert.strictEqual(beneficiaire.email, null)
  assert.strictEqual(beneficiaire.notes, null)
  assert.strictEqual(beneficiaire.anonyme, true)
  assert.ok(beneficiaire.suppression)
  // La valeur statistique survit à l'anonymisation.
  assert.strictEqual(beneficiaire.anneeNaissance, 1980)
})

Then('le texte libre des comptes rendus est effacé', async () => {
  assert.ok(compte)
  const activite = await prismaClient.activite.findUniqueOrThrow({
    where: { id: compte.activiteId },
    select: { notes: true },
  })

  assert.strictEqual(activite.notes, null)
})

Then('les comptes rendus du compte existent toujours', async () => {
  assert.ok(compte)
  assert.strictEqual(
    await prismaClient.activite.count({
      where: { mediateurId: compte.mediateurId },
    }),
    1,
  )
})

Then("les rattachements aux lieux d'activité sont coupés", async () => {
  assert.ok(compte)
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: { mediateurId: compte.mediateurId },
    }),
    0,
  )
})

Then('le partage de statistiques est révoqué', async () => {
  assert.ok(compte)
  const partage = await prismaClient.partageStatistiques.findFirstOrThrow({
    where: { mediateurId: compte.mediateurId },
    select: { deleted: true },
  })

  assert.ok(partage.deleted)
})
