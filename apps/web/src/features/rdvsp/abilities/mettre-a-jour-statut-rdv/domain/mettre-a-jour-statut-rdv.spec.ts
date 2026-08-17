import type { CompteRdv } from '../../../domain/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { RdvId } from '../../../domain/rdv-id'
import { StatutPresence } from '../../../domain/statut-presence'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { statutRdvMisAJour, verifierAcces } from './mettre-a-jour-statut-rdv'

const agentId = RdvAgentId(4242)
const rdvId = RdvId(77)

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId,
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const lie: CompteRdv = { ...base, _tag: 'lie', jetons }

describe('verifierAcces', () => {
  it('autorise le propriétaire du rendez-vous', () => {
    const acces = verifierAcces({ compte: lie, agentIdDuRdv: agentId, rdvId })

    expect(acces.success).toBe(true)
  })

  it('autorise un compte en erreur — c’est en réessayant qu’il en sort', () => {
    const acces = verifierAcces({
      compte: {
        ...base,
        _tag: 'enErreur',
        jetons,
        erreur: MessageErreurCompte('invalid_grant'),
      },
      agentIdDuRdv: agentId,
      rdvId,
    })

    expect(acces.success).toBe(true)
  })

  it('refuse un médiateur sans compte, sans prétendre connaître un agent', () => {
    const acces = verifierAcces({
      compte: null,
      agentIdDuRdv: agentId,
      rdvId,
    })

    expect(acces.success).toBe(false)
    expect(acces.success === false && acces.error).toEqual({
      _tag: 'CompteNonLie',
      agentId: null,
    })
  })

  it('refuse un compte délié', () => {
    const acces = verifierAcces({
      compte: {
        ...base,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      },
      agentIdDuRdv: agentId,
      rdvId,
    })

    expect(acces.success === false && acces.error._tag).toBe('CompteNonLie')
  })

  it('refuse un rendez-vous inconnu de La Coop', () => {
    const acces = verifierAcces({ compte: lie, agentIdDuRdv: null, rdvId })

    expect(acces.success === false && acces.error._tag).toBe('RdvIntrouvable')
  })

  it('refuse un rendez-vous appartenant à un autre agent', () => {
    const acces = verifierAcces({
      compte: lie,
      agentIdDuRdv: RdvAgentId(9999),
      rdvId,
    })

    expect(acces.success === false && acces.error._tag).toBe('RdvNonAutorise')
  })

  it('distingue le rendez-vous d’autrui du rendez-vous inexistant', () => {
    const autrui = verifierAcces({
      compte: lie,
      agentIdDuRdv: RdvAgentId(9999),
      rdvId,
    })
    const inexistant = verifierAcces({
      compte: lie,
      agentIdDuRdv: null,
      rdvId,
    })

    expect(autrui.success === false && autrui.error._tag).not.toBe(
      inexistant.success === false && inexistant.error._tag,
    )
  })
})

describe('statutRdvMisAJour', () => {
  it('mémorise le refus de CRA quand le rendez-vous est déclaré honoré', () => {
    expect(statutRdvMisAJour(StatutPresence('seen'))).toEqual({
      statutPresence: 'seen',
      craRefuse: true,
    })
  })

  it.each(['noshow', 'excused', 'revoked'] as const)(
    'ne mémorise aucun refus pour un rendez-vous « %s », qui n’appelle pas de CRA',
    (statut) => {
      expect(statutRdvMisAJour(StatutPresence(statut))).toEqual({
        statutPresence: statut,
        craRefuse: false,
      })
    },
  )

  it('retient le statut confirmé par RDV Service Public, pas celui demandé', () => {
    // `statutRdvMisAJour` est appelée avec la réponse de l'API : si RDV Service
    // Public a tranché autrement, c'est sa décision qui est enregistrée.
    expect(statutRdvMisAJour(StatutPresence('unknown')).statutPresence).toBe(
      'unknown',
    )
  })
})
