import assert from 'node:assert'
import { Given, Then, When } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import { inscrireALaListeDeDiffusion } from '@/features/utilisateurs/abilities/inscrire-a-la-liste-de-diffusion/domain/inscrire-a-la-liste-de-diffusion'
import {
  type InscriptionALaListe,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { inscrireLeContactALaListe } from '@/features/utilisateurs/implementations/brevo/liste-de-diffusion.mutation'
import { inscritAInscrire } from '@/features/utilisateurs/implementations/prisma/inscrit-a-inscrire.query'
import { semerUnCompteDeListe } from '@/features/utilisateurs/utilisateurs.cucumber'

const inscrire = inscrireALaListeDeDiffusion({
  lireLInscritAInscrire: inscritAInscrire,
  importerLeContact: inscrireLeContactALaListe,
})

const inscription: {
  utilisateurId: UtilisateurId | null
  issue: InscriptionALaListe | null
} = { utilisateurId: null, issue: null }

const semer = async (mediateur: boolean) => {
  inscription.utilisateurId = UtilisateurId(
    await semerUnCompteDeListe({
      prenom: 'Lou',
      marqueur: `Diffusion${v4().slice(0, 8)}`,
      creeLe: new Date('2026-01-01'),
      inscritLe: new Date('2026-01-02'),
      mediateur: mediateur
        ? { derniereActivite: null, dernierBeneficiaire: null }
        : null,
      coordinateur: null,
    }),
  )
}

Given('un médiateur à inscrire à la liste de diffusion', async () => {
  await semer(true)
})

Given('un compte sans rôle à inscrire à la liste de diffusion', async () => {
  await semer(false)
})

When("je l'inscris à la liste de diffusion", async () => {
  assert.ok(inscription.utilisateurId, 'Aucun compte semé')
  const { data } = await inscrire({ utilisateurId: inscription.utilisateurId })
  inscription.issue = data
})

Then('son contact est inscrit avec le rôle {string}', (role: string) => {
  assert.ok(
    inscription.issue?._tag === 'ContactInscrit',
    'Aucun contact inscrit',
  )
  assert.deepStrictEqual(inscription.issue.contact.roles, [role])
})

Then("aucun contact n'est inscrit à la liste de diffusion", () => {
  assert.deepStrictEqual(inscription.issue, { _tag: 'SansContactAInscrire' })
})
