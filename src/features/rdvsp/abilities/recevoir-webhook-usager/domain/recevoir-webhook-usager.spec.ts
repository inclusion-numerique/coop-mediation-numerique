import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { PayloadInexploitable } from '../../../domain/errors'
import { BeneficiaireId } from '../../../domain/identifiants/beneficiaire-id'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '../../../domain/identite'
import type { Usager } from '../../../domain/usager'
import { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import type { RecevoirWebhookUsagerPorts } from './ports'

const beneficiaireLie = BeneficiaireId('3f2504e0-4f89-41d3-9a0c-0305e82c3301')

import { recevoirWebhookUsager } from './recevoir-webhook-usager'

const usager: Usager = {
  id: UsagerId(200),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: EmailExterne('jean.dupont@example.com'),
  telephone: null,
  telephoneFormate: null,
  creation: null,
  invitationCreee: null,
  invitationAcceptee: null,
  dateNaissance: null,
  coordonnees: {
    adresse: null,
    complementAdresse: null,
    numeroAllocataire: null,
    caisseAffiliation: null,
    nomNaissance: null,
  },
  responsableId: null,
  notifierParEmail: false,
  notifierParSms: false,
}

const sansBeneficiaire: RecevoirWebhookUsagerPorts = {
  lireNotification: () => success(usager),
  beneficiairesLies: async () => [],
  mettreAJour: async () => undefined,
  anonymiserEtSupprimer: async () => undefined,
}

const avecBeneficiaire: RecevoirWebhookUsagerPorts = {
  ...sansBeneficiaire,
  beneficiairesLies: async () => [{ id: beneficiaireLie }],
}

const creation = { evenement: EvenementWebhook('created'), payload: {} }
const miseAJour = { evenement: EvenementWebhook('updated'), payload: {} }
const suppression = { evenement: EvenementWebhook('destroyed'), payload: {} }

describe('recevoir une notification portant sur un usager', () => {
  it('renonce à une notification dont le payload a changé de forme', async () => {
    const resultat = await recevoirWebhookUsager({
      ...sansBeneficiaire,
      lireNotification: () => failure(PayloadInexploitable()),
    })(miseAJour)

    expect(resultat).toEqual(failure({ _tag: 'PayloadInexploitable' }))
  })

  it('diffère toute création — un usager sans rendez-vous n’a pas de médiateur', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(creation)

    expect(resultat).toEqual(
      success({ _tag: 'ignore', raison: 'creationDeferee' }),
    )
  })

  it('diffère la création même si un bénéficiaire est déjà rattaché', async () => {
    const resultat = await recevoirWebhookUsager(avecBeneficiaire)(creation)

    expect(resultat).toEqual(
      success({ _tag: 'ignore', raison: 'creationDeferee' }),
    )
  })

  it('met à jour un usager rattaché à un bénéficiaire', async () => {
    const resultat = await recevoirWebhookUsager(avecBeneficiaire)(miseAJour)

    expect(resultat).toEqual(success({ _tag: 'misAJour', usager }))
  })

  it('ignore la mise à jour d’un usager que La Coop ne suit pas', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(miseAJour)

    expect(resultat).toEqual(
      success({ _tag: 'ignore', raison: 'usagerNonSuivi' }),
    )
  })

  it('anonymise les bénéficiaires rattachés à un usager supprimé', async () => {
    const resultat = await recevoirWebhookUsager(avecBeneficiaire)(suppression)

    expect(resultat).toEqual(
      success({
        _tag: 'anonymiseEtSupprime',
        usagerId: UsagerId(200),
        beneficiaires: [{ id: beneficiaireLie }],
      }),
    )
  })

  it('applique une suppression, même sans bénéficiaire rattaché', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(suppression)

    expect(resultat).toEqual(
      success({
        _tag: 'anonymiseEtSupprime',
        usagerId: UsagerId(200),
        beneficiaires: [],
      }),
    )
  })
})
