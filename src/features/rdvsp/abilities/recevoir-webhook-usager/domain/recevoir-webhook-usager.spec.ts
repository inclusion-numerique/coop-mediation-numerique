import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '../../../domain/identite'
import type { Usager } from '../../../domain/usager'
import { EvenementWebhook } from '../../../domain/webhook/evenement-webhook'
import {
  type DependancesRecevoirWebhookUsager,
  recevoirWebhookUsager,
} from './recevoir-webhook-usager'

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

const sansBeneficiaire: DependancesRecevoirWebhookUsager = {
  lireNotification: () => success(usager),
  beneficiairesLies: async () => [],
  mettreAJour: async () => undefined,
  anonymiserEtSupprimer: async () => undefined,
}

const avecBeneficiaire: DependancesRecevoirWebhookUsager = {
  ...sansBeneficiaire,
  beneficiairesLies: async () => [{ id: 'b1' }],
}

const notification = (evenement: 'created' | 'updated' | 'destroyed') => ({
  evenement: EvenementWebhook(evenement),
  payload: {},
})

describe('recevoirWebhookUsager', () => {
  it('renonce à une notification dont le payload a changé de forme', async () => {
    const resultat = await recevoirWebhookUsager({
      ...sansBeneficiaire,
      lireNotification: () => failure('payloadInexploitable'),
    })(notification('updated'))

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'payloadInexploitable' })
  })

  it('diffère toute création — un usager sans rendez-vous n’a pas de médiateur', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(
      notification('created'),
    )

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'creationDeferee' })
  })

  it('diffère la création même si un bénéficiaire est déjà rattaché', async () => {
    const resultat = await recevoirWebhookUsager(avecBeneficiaire)(
      notification('created'),
    )

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'creationDeferee' })
  })

  it('met à jour un usager rattaché à un bénéficiaire', async () => {
    const resultat = await recevoirWebhookUsager(avecBeneficiaire)(
      notification('updated'),
    )

    expect(resultat).toEqual({ _tag: 'traite', action: 'misAJour' })
  })

  it('ignore la mise à jour d’un usager que La Coop ne suit pas', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(
      notification('updated'),
    )

    expect(resultat).toEqual({ _tag: 'ignore', raison: 'usagerNonSuivi' })
  })

  it('applique une suppression, même sans bénéficiaire rattaché', async () => {
    const resultat = await recevoirWebhookUsager(sansBeneficiaire)(
      notification('destroyed'),
    )

    expect(resultat).toEqual({ _tag: 'traite', action: 'anonymiseEtSupprime' })
  })
})
