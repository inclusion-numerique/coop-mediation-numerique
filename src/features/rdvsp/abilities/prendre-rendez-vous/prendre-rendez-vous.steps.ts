import assert from 'node:assert'
import { Given, Then, When, type World } from '@cucumber/cucumber'
import { v4 } from 'uuid'
import {
  BeneficiaireCibleId,
  MediateurProprietaireId,
} from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/beneficiaire-cible'
import { prendreRendezVous } from '@/features/rdvsp/abilities/prendre-rendez-vous/domain/prendre-rendez-vous'
import { beneficiaireADemander } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/beneficiaire-a-demander.query'
import { compteDuMediateur } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/compte-du-mediateur.query'
import { lierUsagerAuBeneficiaire } from '@/features/rdvsp/abilities/prendre-rendez-vous/implementations/prisma/lier-usager-au-beneficiaire.mutation'
import { ApiIndisponible } from '@/features/rdvsp/domain/errors'
import { UsagerId } from '@/features/rdvsp/domain/identifiants/usager-id'
import {
  DemandeRdvId,
  UrlPriseRdv,
  type UsagerDeLaDemande,
} from '@/features/rdvsp/domain/rdv/demande-rdv'
import {
  beneficiaireEnBase,
  ID_TEST,
  seedAutreMediateur,
  seedBeneficiaire,
  seedCompteRdv,
  seedUsagerRdv,
  suivreUsagerRdv,
  supprimerCompteRdvDuMediateur,
  testMediateurId,
  testUtilisateurId,
} from '@/features/rdvsp/rdvsp.cucumber'
import { failure, success } from '@/libraries/result'

const AGENT_ID = ID_TEST.compte + 5
const USAGER_RENDU = ID_TEST.usager + 2

type Monde = World & {
  beneficiaireId?: string
  usagerRecu?: UsagerDeLaDemande
  apiRefuse?: boolean
  resultat?: Awaited<ReturnType<ReturnType<typeof prendreRendezVous>>>
}

const planifierPour = (monde: Monde) =>
  prendreRendezVous({
    beneficiaireADemander,
    compteDuMediateur,
    creerDemandeRdv: async (_compte, demande) => {
      monde.usagerRecu = demande.usager

      if (monde.apiRefuse) {
        return failure(ApiIndisponible(503, 'service indisponible'))
      }

      const usagerId =
        demande.usager._tag === 'existant'
          ? demande.usager.id
          : UsagerId(USAGER_RENDU)

      suivreUsagerRdv(usagerId)

      return success({
        id: DemandeRdvId(1),
        usagerId,
        url: UrlPriseRdv('https://rdv.anct.gouv.fr/prendre-rdv/1'),
        rdvId: null,
      })
    },
    lierUsager: lierUsagerAuBeneficiaire,
    urlDossierBeneficiaire: (id) =>
      `https://coop.test/coop/mes-beneficiaires/${id}/accompagnements`,
  })

Given('un bénéficiaire suivi sans usager RDV', async function (this: Monde) {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  this.beneficiaireId = await seedBeneficiaire({
    prenom: 'Jean',
    nom: 'Dupont',
    email: 'jean.dupont@example.com',
  })
})

Given(
  'un bénéficiaire suivi déjà rattaché à l’usager RDV {int}',
  async function (this: Monde, usagerId: number) {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    await seedUsagerRdv(usagerId)
    this.beneficiaireId = await seedBeneficiaire({
      prenom: 'Jean',
      nom: 'Dupont',
      rdvUserId: usagerId,
    })
  },
)

Given('un bénéficiaire suivi sans identité', async function (this: Monde) {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
  this.beneficiaireId = await seedBeneficiaire({ anonyme: true })
})

Given(
  'un bénéficiaire suivi par un autre médiateur',
  async function (this: Monde) {
    await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
    this.beneficiaireId = await seedBeneficiaire({
      prenom: 'Jean',
      nom: 'Dupont',
      mediateurId: await seedAutreMediateur(),
    })
  },
)

Given('aucun bénéficiaire à planifier', async () => {
  await seedCompteRdv({ id: AGENT_ID, accessToken: 'jeton-acces' })
})

Given('aucun compte RDV pour planifier', async () => {
  await supprimerCompteRdvDuMediateur()
})

Given('RDV Service Public refusera la demande', function (this: Monde) {
  this.apiRefuse = true
})

When(
  'je planifie un rendez-vous avec ce bénéficiaire',
  async function (this: Monde) {
    assert.ok(this.beneficiaireId, 'Aucun bénéficiaire à planifier')
    this.resultat = await planifierPour(this)({
      utilisateurId: testUtilisateurId,
      mediateurId: MediateurProprietaireId(testMediateurId),
      beneficiaireId: BeneficiaireCibleId(this.beneficiaireId),
    })
  },
)

When(
  'je planifie un rendez-vous avec un bénéficiaire inexistant',
  async function (this: Monde) {
    this.resultat = await planifierPour(this)({
      utilisateurId: testUtilisateurId,
      mediateurId: MediateurProprietaireId(testMediateurId),
      beneficiaireId: BeneficiaireCibleId(v4()),
    })
  },
)

Then('RDV Service Public reçoit une identité à créer', function (this: Monde) {
  assert.strictEqual(this.usagerRecu?._tag, 'aCreer')
})

Then(
  'RDV Service Public reçoit l’usager existant {int}',
  function (this: Monde, usagerId: number) {
    assert.deepStrictEqual(this.usagerRecu, { _tag: 'existant', id: usagerId })
  },
)

Then(
  'le bénéficiaire est rattaché à l’usager rendu',
  async function (this: Monde) {
    assert.ok(this.beneficiaireId)
    assert.strictEqual(
      (await beneficiaireEnBase(this.beneficiaireId))?.rdvUserId,
      USAGER_RENDU,
    )
  },
)

Then(
  'le bénéficiaire reste rattaché à l’usager {int}',
  async function (this: Monde, usagerId: number) {
    assert.ok(this.beneficiaireId)
    assert.strictEqual(
      (await beneficiaireEnBase(this.beneficiaireId))?.rdvUserId,
      usagerId,
    )
  },
)

Then('la demande aboutit', function (this: Monde) {
  assert.ok(this.resultat?.success, 'La demande a échoué')
})

Then(
  'la demande échoue avec l’erreur {string}',
  function (this: Monde, tag: string) {
    assert.ok(
      this.resultat && !this.resultat.success,
      'La demande aurait dû échouer',
    )
    assert.strictEqual(this.resultat.error._tag, tag)
  },
)

Then('RDV Service Public n’a reçu aucune demande', function (this: Monde) {
  assert.strictEqual(this.usagerRecu, undefined)
})

Then(
  'le bénéficiaire n’est rattaché à aucun usager',
  async function (this: Monde) {
    assert.ok(this.beneficiaireId)
    assert.strictEqual(
      (await beneficiaireEnBase(this.beneficiaireId))?.rdvUserId,
      null,
    )
  },
)
