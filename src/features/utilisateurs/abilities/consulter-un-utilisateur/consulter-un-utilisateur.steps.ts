import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { prismaClient } from '@/configuration/prisma'
import { UtilisateurId } from '@/features/utilisateurs/domain'
import { libelleDuStatut } from '@/features/utilisateurs/ui/presenters/statut-compte.presenter'
import {
  type CompteSeme,
  semerCompte,
} from '@/features/utilisateurs/utilisateurs.cucumber'
import type { FicheUtilisateur } from './domain'
import { ficheUtilisateur } from './implementations/prisma/fiche-utilisateur.query'

const consultation: {
  compte?: CompteSeme
  fiche?: FicheUtilisateur | null
} = {}

const compte = (): CompteSeme => {
  assert.ok(consultation.compte, 'Aucun compte semé')
  return consultation.compte
}

const fiche = (): FicheUtilisateur => {
  assert.ok(consultation.fiche, 'Aucune fiche consultée')
  return consultation.fiche
}

const consulter = async (identifiant: string) => {
  const utilisateurId = UtilisateurId.safe(identifiant)
  consultation.fiche =
    utilisateurId === null
      ? null
      : await ficheUtilisateur({ utilisateurId, maintenant: new Date() })
}

Given('un compte médiateur à consulter', async () => {
  consultation.compte = await semerCompte()
})

Given("ce compte a saisi une activité aujourd'hui", async () => {
  await prismaClient.mediateur.update({
    where: { id: compte().mediateurId },
    data: { derniereCreationActivite: new Date() },
  })
})

When("l'administration consulte la fiche de ce compte", async () => {
  await consulter(compte().userId)
})

When(
  "l'administration consulte la fiche d'un compte qui n'existe pas",
  async () => {
    await consulter(v4())
  },
)

When(
  "l'administration consulte la fiche {string}",
  async (identifiant: string) => {
    await consulter(identifiant)
  },
)

Then(
  'la fiche montre la liaison au fournisseur {string}',
  (fournisseur: string) => {
    assert.deepStrictEqual(fiche().liaisons, [
      { fournisseur, identifiant: `sub-${compte().userId}` },
    ])
  },
)

Then('la fiche ne contient aucun jeton de connexion', () => {
  const contenu = JSON.stringify(fiche())

  assert.ok(!contenu.includes('jeton-acces'))
  assert.ok(!contenu.includes('jeton-rafraichissement'))
  assert.ok(!contenu.includes('jeton-identite'))
  assert.ok(!contenu.includes(`session-${compte().userId}`))
})

Then('la fiche affiche le statut {string}', (libelle: string) => {
  assert.strictEqual(libelleDuStatut(fiche().statut), libelle)
})

Then("aucune fiche d'utilisateur n'est trouvée", () => {
  assert.strictEqual(consultation.fiche, null)
})
