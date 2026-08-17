import { type CompteRdv, MessageErreurCompte } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { reclameUneIntervention, santeDuCompte } from './sante-compte'

const maintenant = new Date('2026-08-17T12:00:00.000Z')

const jetons = (expiration: Date | null): JetonsOAuth => ({
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration,
  portee: null,
})

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

describe('santeDuCompte', () => {
  it('tient pour opérationnel un compte lié dont le jeton court encore', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(new Date('2026-08-17T18:00:00.000Z')),
    }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('tient pour opérationnel un compte sans expiration connue', () => {
    const compte: CompteRdv = { ...base, _tag: 'lie', jetons: jetons(null) }

    expect(santeDuCompte(compte, maintenant)._tag).toBe('operationnel')
  })

  it('signale un jeton expiré à part, sans le confondre avec une panne', () => {
    const expiration = new Date('2026-08-17T06:00:00.000Z')
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons: jetons(expiration),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'jetonExpire',
      depuis: expiration,
    })
  })

  it('remonte le message d’un compte en erreur', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'enErreur',
      jetons: jetons(null),
      erreur: MessageErreurCompte('invalid_grant'),
    }

    expect(santeDuCompte(compte, maintenant)).toEqual({
      _tag: 'enErreur',
      message: 'invalid_grant',
    })
  })

  it('distingue un compte jamais lié', () => {
    expect(santeDuCompte({ ...base, _tag: 'nonLie' }, maintenant)._tag).toBe(
      'jamaisLie',
    )
  })

  it('distingue une déconnexion décidée par l’utilisateur', () => {
    const quand = new Date('2026-07-08T00:00:00.000Z')

    expect(
      santeDuCompte(
        { ...base, _tag: 'deconnecte', deconnexion: quand },
        maintenant,
      ),
    ).toEqual({ _tag: 'deconnecteParUtilisateur', quand })
  })
})

describe('reclameUneIntervention', () => {
  it.each([
    ['enErreur', true],
    ['jamaisLie', true],
    ['operationnel', false],
    ['deconnecteParUtilisateur', false],
    ['jetonExpire', false],
  ] as const)('pour un compte « %s » : %s', (tag, attendu) => {
    const sante =
      tag === 'enErreur'
        ? ({ _tag: 'enErreur', message: 'x' } as const)
        : tag === 'jetonExpire'
          ? ({ _tag: 'jetonExpire', depuis: maintenant } as const)
          : tag === 'deconnecteParUtilisateur'
            ? ({ _tag: 'deconnecteParUtilisateur', quand: maintenant } as const)
            : ({ _tag: tag } as const)

    expect(reclameUneIntervention(sante)).toBe(attendu)
  })
})
