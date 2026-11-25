import { describe, expect, it } from 'vitest'
import {
  declencherSynchronisation,
  MESSAGE_ECHEC,
  peutDeclencherPour,
  peutRelancerUnCompteEnErreur,
  porteePour,
} from '@/features/rdvsp/abilities/declencher-synchronisation/domain/declencher-synchronisation'
import type { CompteRdvLie } from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  type CompteRdv,
  MessageErreurCompte,
} from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '@/features/rdvsp/domain/compte/jetons-oauth'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { failure } from '@/libraries/result'

const moi = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const autrui = UtilisateurCoopId('9c858901-8a57-4791-81fe-4c455b099bc9')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const socle = {
  agentId: RdvAgentId(4242),
  utilisateurId: moi,
  organisationIds: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const compte = (sansWebhook: number[]): CompteRdv => ({
  ...socle,
  _tag: 'lie',
  jetons,
  organisationIdsSansWebhook: sansWebhook.map((id) => OrganisationId(id)),
})

const compteEnErreur: CompteRdv = {
  ...socle,
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('Impossible de récupérer les données'),
  organisationIdsSansWebhook: [OrganisationId(10)],
}

const compteDeconnecte: CompteRdv = {
  ...socle,
  _tag: 'deconnecte',
  deconnexion: new Date('2026-08-01T10:00:00Z'),
  organisationIdsSansWebhook: [OrganisationId(10)],
}

describe('peutDeclencherPour', () => {
  it('autorise chacun pour lui-même', () => {
    expect(peutDeclencherPour({ id: moi, role: 'User' }, moi)).toBe(true)
  })

  it('refuse un médiateur pour le compte d’un autre', () => {
    expect(peutDeclencherPour({ id: moi, role: 'User' }, autrui)).toBe(false)
  })

  it('autorise un administrateur pour n’importe qui — la synchronisation est aussi un dépannage', () => {
    expect(peutDeclencherPour({ id: moi, role: 'Admin' }, autrui)).toBe(true)
  })
})

describe('porteePour', () => {
  it('parcourt toutes les organisations quand la synchronisation est demandée en entier', () => {
    expect(porteePour(compte([10]), false, false)).toEqual({
      _tag: 'toutesOrganisations',
    })
  })

  it('restreint le rattrapage aux organisations sans webhook', () => {
    expect(porteePour(compte([10, 20]), true, false)).toEqual({
      _tag: 'organisations',
      organisationIds: [10, 20],
    })
  })

  it('ne rattrape rien quand tous les webhooks sont posés — une portée vide n’est pas une portée absente', () => {
    expect(porteePour(compte([]), true, false)).toEqual({ _tag: 'sansObjet' })
  })

  it('n’appelle pas l’API pour un compte délié, même en synchronisation complète', () => {
    expect(porteePour(compteDeconnecte, false, false)).toEqual({
      _tag: 'sansObjet',
    })
  })
})

describe('compte en erreur', () => {
  it('n’est plus synchronisé à la demande de son médiateur', () => {
    expect(porteePour(compteEnErreur, false, false)).toEqual({
      _tag: 'sansObjet',
    })
  })

  it('n’est pas rattrapé au chargement d’un écran', () => {
    expect(porteePour(compteEnErreur, true, true)).toEqual({
      _tag: 'sansObjet',
    })
  })

  it('peut être relancé en entier par l’assistance', () => {
    expect(porteePour(compteEnErreur, false, true)).toEqual({
      _tag: 'toutesOrganisations',
    })
  })

  it.each([
    ['Admin', true],
    ['User', false],
  ] as const)('relance autorisée pour un profil %s : %s', (role, attendu) => {
    expect(peutRelancerUnCompteEnErreur({ id: moi, role })).toBe(attendu)
  })
})

/**
 * Ce que l'échec d'une passe doit laisser sur le compteLie.
 *
 * Le drapeau `error` n'est pas une trace de diagnostic — le journal de
 * synchronisation en tient une, quoi qu'il arrive. C'est lui qui affiche au
 * médiateur l'alerte l'invitant à reconnecter son compteLie. Le poser sur une panne
 * passagère envoie refaire un parcours OAuth pour rien.
 */

const UTILISATEUR = UtilisateurCoopId('11111111-1111-4111-8111-111111111111')

const compteLie: CompteRdvLie = {
  _tag: 'lie',
  agentId: RdvAgentId(5166),
  utilisateurId: UTILISATEUR,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  jetons: {
    acces: JetonAcces('acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const declencherQuiEchoue = (echecDefinitif: (erreur: unknown) => boolean) =>
  declencherSynchronisation({
    compteACible: async () => compteLie,
    lancer: async () => {
      throw new Error('API injoignable')
    },
    echecDefinitif,
  })({
    demandeur: { id: UTILISATEUR, role: 'User' },
    utilisateurId: UTILISATEUR,
    seulementSansWebhook: false,
  })

describe('échec d’une synchronisation déclenchée', () => {
  it('ne marque pas le compte quand un nouvel essai peut aboutir', async () => {
    const resultat = await declencherQuiEchoue(() => false)

    expect(resultat).toEqual(
      failure({ _tag: 'SynchronisationEchouee', marquage: null }),
    )
  })

  it('marque le compte quand réessayer ne servirait à rien', async () => {
    const resultat = await declencherQuiEchoue(() => true)

    expect(resultat).toEqual(
      failure({
        _tag: 'SynchronisationEchouee',
        marquage: { agentId: compteLie.agentId, message: MESSAGE_ECHEC },
      }),
    )
  })
})
