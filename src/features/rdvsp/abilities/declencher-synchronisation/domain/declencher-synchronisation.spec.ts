import { describe, expect, it } from 'vitest'
import {
  declencherSynchronisation,
  MESSAGE_ECHEC,
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
import { failure, success } from '@/libraries/result'

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

const instant = new Date('2026-11-26T08:00:00.000Z')

const declencher = (compteCible: CompteRdv | null) =>
  declencherSynchronisation({
    compteACible: async () => compteCible,
    lancer: async () => ({ derive: 4 }),
    maintenant: () => instant,
  })

const synchronise = success({ derive: 4, synchroniseeLe: instant })
const sansObjet = success({ derive: 0, synchroniseeLe: null })

describe('qui peut déclencher', () => {
  it('autorise chacun pour lui-même', async () => {
    const resultat = await declencher(compte([10]))({
      demandeur: { id: moi, role: 'User' },
      utilisateurId: moi,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(synchronise)
  })

  it('refuse un médiateur pour le compte d’un autre', async () => {
    const resultat = await declencher(compte([10]))({
      demandeur: { id: moi, role: 'User' },
      utilisateurId: autrui,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(failure({ _tag: 'NonAutorise' }))
  })

  it('autorise un administrateur pour n’importe qui — la synchronisation est aussi un dépannage', async () => {
    const resultat = await declencher(compte([10]))({
      demandeur: { id: moi, role: 'Admin' },
      utilisateurId: autrui,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(synchronise)
  })

  it('signale un utilisateur sans compte RDV', async () => {
    const resultat = await declencher(null)({
      demandeur: { id: moi, role: 'User' },
      utilisateurId: moi,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(failure({ _tag: 'CompteRdvIntrouvable' }))
  })
})

describe('portée de la passe', () => {
  it.each<{
    cas: string
    compteCible: CompteRdv
    role: 'User' | 'Admin'
    seulementSansWebhook: boolean
  }>([
    {
      cas: 'parcourt toutes les organisations quand la synchronisation est demandée en entier',
      compteCible: compte([10]),
      role: 'User',
      seulementSansWebhook: false,
    },
    {
      cas: 'rattrape les organisations sans webhook',
      compteCible: compte([10, 20]),
      role: 'User',
      seulementSansWebhook: true,
    },
    {
      cas: 'relance en entier un compte en erreur à la demande de l’assistance',
      compteCible: compteEnErreur,
      role: 'Admin',
      seulementSansWebhook: false,
    },
  ])('$cas', async ({ compteCible, role, seulementSansWebhook }) => {
    const resultat = await declencher(compteCible)({
      demandeur: { id: moi, role },
      utilisateurId: moi,
      seulementSansWebhook,
    })

    expect(resultat).toEqual(synchronise)
  })

  it.each<{
    cas: string
    compteCible: CompteRdv
    role: 'User' | 'Admin'
    seulementSansWebhook: boolean
  }>([
    {
      cas: 'ne rattrape rien quand tous les webhooks sont posés — une portée vide n’est pas une portée absente',
      compteCible: compte([]),
      role: 'User',
      seulementSansWebhook: true,
    },
    {
      cas: 'n’appelle pas l’API pour un compte délié, même en synchronisation complète',
      compteCible: compteDeconnecte,
      role: 'User',
      seulementSansWebhook: false,
    },
    {
      cas: 'ne synchronise plus un compte en erreur à la demande de son médiateur',
      compteCible: compteEnErreur,
      role: 'User',
      seulementSansWebhook: false,
    },
    {
      cas: 'ne rattrape pas un compte en erreur au chargement d’un écran, même pour l’assistance',
      compteCible: compteEnErreur,
      role: 'Admin',
      seulementSansWebhook: true,
    },
  ])('$cas', async ({ compteCible, role, seulementSansWebhook }) => {
    const resultat = await declencher(compteCible)({
      demandeur: { id: moi, role },
      utilisateurId: moi,
      seulementSansWebhook,
    })

    expect(resultat).toEqual(sansObjet)
  })

  it('date la synchronisation de l’instant présent sans horloge fournie', async () => {
    const resultat = await declencherSynchronisation({
      compteACible: async () => compte([10]),
      lancer: async () => ({ derive: 4 }),
    })({
      demandeur: { id: moi, role: 'User' },
      utilisateurId: moi,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(
      success({ derive: 4, synchroniseeLe: expect.any(Date) }),
    )
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

  it('marque le compte par défaut, faute de savoir distinguer l’échec', async () => {
    const resultat = await declencherSynchronisation({
      compteACible: async () => compteLie,
      lancer: async () => {
        throw new Error('API injoignable')
      },
    })({
      demandeur: { id: UTILISATEUR, role: 'User' },
      utilisateurId: UTILISATEUR,
      seulementSansWebhook: false,
    })

    expect(resultat).toEqual(
      failure({
        _tag: 'SynchronisationEchouee',
        marquage: { agentId: compteLie.agentId, message: MESSAGE_ECHEC },
      }),
    )
  })
})
