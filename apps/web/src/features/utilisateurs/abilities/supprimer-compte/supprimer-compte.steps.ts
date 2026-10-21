import assert from 'node:assert'
import { supprimerComptePorts } from '@app/web/composition/utilisateurs/supprimer-compte.ports'
import { effacerEmpreinteRdvAvec } from '@app/web/features/rdvsp/abilities/effacer-empreinte-rdv'
import { AuteurId, UtilisateurId } from '@app/web/features/utilisateurs/domain'
import {
  type CompteSeme,
  semerCompte,
} from '@app/web/features/utilisateurs/utilisateurs.cucumber'
import { success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { supprimerCompte } from './commands/supprimer-compte'
import {
  type AuteurSuppression,
  RetentionPolicy,
  type SupprimerComptePorts,
} from './domain'

const ports: SupprimerComptePorts = {
  ...supprimerComptePorts,
  effacerEmpreinteRdv: effacerEmpreinteRdvAvec(async () => success(undefined)),
  retirerDesListesDeDiffusion: async () => false,
}

type Effacement = Awaited<ReturnType<typeof supprimerCompte>>

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
    command: { cible: UtilisateurId(cible), auteur, maintenant: new Date() },
    ports,
  })
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

Then('le portefeuille de bénéficiaires est anonymisé', async () => {
  const beneficiaire = await prismaClient.beneficiaire.findUniqueOrThrow({
    where: { id: compteSeme().beneficiaireId },
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
  assert.strictEqual(beneficiaire.anneeNaissance, 1980)
})

Then('le texte libre des comptes rendus est effacé', async () => {
  const activite = await prismaClient.activite.findUniqueOrThrow({
    where: { id: compteSeme().activiteId },
    select: { notes: true },
  })

  assert.strictEqual(activite.notes, null)
})

Then('les comptes rendus du compte existent toujours', async () => {
  assert.strictEqual(
    await prismaClient.activite.count({
      where: { mediateurId: compteSeme().mediateurId },
    }),
    1,
  )
})

Then("les rattachements aux lieux d'activité sont coupés", async () => {
  assert.strictEqual(
    await prismaClient.mediateurEnActivite.count({
      where: { mediateurId: compteSeme().mediateurId },
    }),
    0,
  )
})

Then('le partage de statistiques est révoqué', async () => {
  const partage = await prismaClient.partageStatistiques.findFirstOrThrow({
    where: { mediateurId: compteSeme().mediateurId },
    select: { deleted: true },
  })

  assert.ok(partage.deleted)
})
