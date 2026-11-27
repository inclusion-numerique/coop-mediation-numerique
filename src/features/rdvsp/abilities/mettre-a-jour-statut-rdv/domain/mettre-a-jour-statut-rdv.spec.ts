import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible } from '../../../domain/errors'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  StatutPresence,
  StatutPresenceModifiable,
} from '../../../domain/rdv/statut-presence'
import { mettreAJourStatutRdv } from './mettre-a-jour-statut-rdv'
import type { MettreAJourStatutRdvPorts } from './ports'

const agentId = RdvAgentId(4242)
const rdvId = RdvId(77)
const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId,
  utilisateurId,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

const lie: CompteRdv = { ...base, _tag: 'lie', jetons }

const enErreur: CompteRdv = {
  ...base,
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('invalid_grant'),
}

const deconnecte: CompteRdv = {
  ...base,
  _tag: 'deconnecte',
  deconnexion: new Date('2026-07-08T00:00:00.000Z'),
}

const proprietaire: MettreAJourStatutRdvPorts = {
  contexte: async () => ({ compte: lie, agentIdDuRdv: agentId }),
  changerStatutRdv: async () => success(StatutPresence('seen')),
  enregistrer: async () => undefined,
}

const demande = {
  utilisateurId,
  rdvId,
  statut: StatutPresenceModifiable('seen'),
}

describe('mettre à jour le statut d’un rendez-vous', () => {
  describe('contrôle d’accès', () => {
    it('autorise le propriétaire du rendez-vous', async () => {
      expect(await mettreAJourStatutRdv(proprietaire)(demande)).toEqual(
        success({
          rdvId,
          statut: { statutPresence: 'seen', compteRenduRegle: true },
        }),
      )
    })

    it('autorise un compte en erreur — c’est en réessayant qu’il en sort', async () => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        contexte: async () => ({ compte: enErreur, agentIdDuRdv: agentId }),
      })(demande)

      expect(resultat).toEqual(
        success({
          rdvId,
          statut: { statutPresence: 'seen', compteRenduRegle: true },
        }),
      )
    })

    it('refuse un médiateur sans compte, sans prétendre connaître un agent', async () => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        contexte: async () => ({ compte: null, agentIdDuRdv: agentId }),
      })(demande)

      expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId: null }))
    })

    it('refuse un compte délié', async () => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        contexte: async () => ({ compte: deconnecte, agentIdDuRdv: agentId }),
      })(demande)

      expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId }))
    })

    it('refuse un rendez-vous inconnu de La Coop', async () => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        contexte: async () => ({ compte: lie, agentIdDuRdv: null }),
      })(demande)

      expect(resultat).toEqual(failure({ _tag: 'RdvIntrouvable', id: rdvId }))
    })

    it('refuse un rendez-vous appartenant à un autre agent, distinct d’un rendez-vous inexistant', async () => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        contexte: async () => ({
          compte: lie,
          agentIdDuRdv: RdvAgentId(9999),
        }),
      })(demande)

      expect(resultat).toEqual(failure({ _tag: 'RdvNonAutorise', rdvId }))
    })
  })

  it('laisse la base intacte quand RDV Service Public refuse le changement', async () => {
    const resultat = await mettreAJourStatutRdv({
      ...proprietaire,
      changerStatutRdv: async () =>
        failure(ApiIndisponible(503, 'maintenance')),
    })(demande)

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it.each<[string, StatutPresence]>([
    ['noshow', StatutPresence('noshow')],
    ['excused', StatutPresence('excused')],
    ['revoked', StatutPresence('revoked')],
  ])(
    'ne mémorise aucun refus pour un rendez-vous « %s », qui n’appelle pas de CRA',
    async (_, statutConfirme) => {
      const resultat = await mettreAJourStatutRdv({
        ...proprietaire,
        changerStatutRdv: async () => success(statutConfirme),
      })(demande)

      expect(resultat).toEqual(
        success({
          rdvId,
          statut: { statutPresence: statutConfirme, compteRenduRegle: false },
        }),
      )
    },
  )

  it('retient le statut confirmé par RDV Service Public, pas celui demandé', async () => {
    const resultat = await mettreAJourStatutRdv({
      ...proprietaire,
      changerStatutRdv: async () => success(StatutPresence('unknown')),
    })(demande)

    expect(resultat).toEqual(
      success({
        rdvId,
        statut: { statutPresence: 'unknown', compteRenduRegle: false },
      }),
    )
  })
})
