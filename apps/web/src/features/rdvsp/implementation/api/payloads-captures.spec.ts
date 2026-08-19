import { RdvAgentId } from '../../domain/rdv-agent-id'
import { rdvPayload } from './payloads'
import { payloadsRdvCaptures } from './payloads-captures.fixture'
import { rdvToDomain } from './to-domain'

const AGENT_ID = RdvAgentId(2732)

/**
 * Confronte nos schémas aux réponses que RDV Service Public émet réellement.
 *
 * Les autres tests de cette couche partent de payloads que nous avons écrits :
 * ils vérifient que la traduction est juste, jamais que la source ressemble à ce
 * que nous attendons. C'est le seul endroit où le contrat du tiers est éprouvé.
 */
describe('payloads réels de RDV Service Public', () => {
  it.each(payloadsRdvCaptures.map((payload) => [payload.id, payload] as const))(
    'le rendez-vous %s est accepté par le schéma',
    (_id, payload) => {
      const analyse = rdvPayload.safeParse(payload)

      // Le détail de l'écart vaut mieux qu'un booléen : c'est lui qui dira quel
      // champ a bougé chez eux.
      expect(analyse.error?.issues ?? []).toEqual([])
      expect(analyse.success).toBe(true)
    },
  )

  it.each(payloadsRdvCaptures.map((payload) => [payload.id, payload] as const))(
    'le rendez-vous %s se traduit en domaine',
    (_id, payload) => {
      const analyse = rdvPayload.parse(payload)
      const rdv = rdvToDomain(analyse, AGENT_ID)

      expect(rdv.id).toBe(payload.id)
      expect(rdv.organisationId).toBe(payload.organisation.id)
      expect(rdv.participations).toHaveLength(payload.participations.length)
    },
  )

  it('couvre les états que la synchronisation doit distinguer', () => {
    const statuts = new Set(payloadsRdvCaptures.map(({ status }) => status))

    expect(statuts).toEqual(new Set(['unknown', 'seen', 'revoked', 'excused']))
  })

  it('couvre un rendez-vous collectif à plusieurs participations', () => {
    const collectifs = payloadsRdvCaptures.filter(({ collectif }) => collectif)

    expect(collectifs.length).toBeGreaterThan(0)
    expect(
      collectifs.some(({ participations }) => participations.length > 1),
    ).toBe(true)
  })

  it('ne porte aucune donnée personnelle réelle', () => {
    const texte = JSON.stringify(payloadsRdvCaptures)

    // Garde-fou du jour où quelqu'un rafraîchira la fixture depuis une base.
    expect(texte).not.toMatch(/@(?!example\.org)[\w.-]+\.[a-z]{2,}/i)
    expect(texte).not.toMatch(/\+33(?!600000)\d{9}/)
  })
})
