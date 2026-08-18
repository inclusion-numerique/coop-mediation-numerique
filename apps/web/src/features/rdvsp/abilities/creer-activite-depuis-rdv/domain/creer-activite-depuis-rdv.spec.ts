import type { CompteRdv } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { RdvId } from '../../../domain/rdv-id'
import { StatutPresence } from '../../../domain/statut-presence'
import { UsagerId } from '../../../domain/usager-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { usagersPourActivite, verifierRdv } from './creer-activite-depuis-rdv'
import type { ParticipationDuRdv, RdvPourActivite } from './rdv-pour-activite'

const agentId = RdvAgentId(4242)
const rdvId = RdvId(77)

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const compte: CompteRdv = {
  agentId,
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
  _tag: 'lie',
  jetons,
}

const participation = (
  statut: 'seen' | 'unknown' | 'excused' | 'revoked' | 'noshow',
  usagerId: number,
): ParticipationDuRdv => ({
  statutPresence: StatutPresence(statut),
  usager: {
    id: UsagerId(usagerId),
    prenom: 'Jean',
    nom: 'Dupont',
    email: null,
    telephone: null,
    adresse: null,
    dateNaissance: null,
  },
})

const rdvAvec = (
  participations: ParticipationDuRdv[],
  statutDuRdv:
    | 'seen'
    | 'unknown'
    | 'excused'
    | 'revoked'
    | 'noshow' = 'unknown',
): RdvPourActivite => ({
  id: rdvId,
  agentId,
  statutPresence: StatutPresence(statutDuRdv),
  participations,
})

describe('usagersPourActivite', () => {
  it('retient les participants présents', () => {
    const usagers = usagersPourActivite(rdvAvec([participation('seen', 1)]))

    expect(usagers.map(({ id }) => id)).toEqual([1])
  })

  it('retient ceux dont la présence n’a pas encore été saisie', () => {
    const usagers = usagersPourActivite(rdvAvec([participation('unknown', 2)]))

    expect(usagers.map(({ id }) => id)).toEqual([2])
  })

  it.each(['excused', 'revoked', 'noshow'] as const)(
    'écarte un participant « %s », qui n’a pas été rencontré',
    (statut) => {
      expect(usagersPourActivite(rdvAvec([participation(statut, 3)]))).toEqual(
        [],
      )
    },
  )

  it('ne garde que les présents d’un atelier partiellement honoré', () => {
    const usagers = usagersPourActivite(
      rdvAvec(
        [
          participation('seen', 1),
          participation('noshow', 2),
          participation('unknown', 3),
          participation('excused', 4),
        ],
        'seen',
      ),
    )

    expect(usagers.map(({ id }) => id)).toEqual([1, 3])
  })

  // Le médiateur ne peut déclarer une absence que sur le rendez-vous entier :
  // c'est le seul statut que La Coop écrit. La participation reste `unknown`, et
  // la lire seule reviendrait à créer une fiche pour quelqu'un qu'il a justement
  // déclaré absent.
  it.each(['excused', 'revoked', 'noshow'] as const)(
    'écarte une participation non saisie d’un rendez-vous « %s »',
    (statutDuRdv) => {
      expect(
        usagersPourActivite(
          rdvAvec([participation('unknown', 5)], statutDuRdv),
        ),
      ).toEqual([])
    },
  )

  it('retient une participation explicitement présente sur un rendez-vous annulé', () => {
    const usagers = usagersPourActivite(
      rdvAvec([participation('seen', 6)], 'revoked'),
    )

    expect(usagers.map(({ id }) => id)).toEqual([6])
  })

  it('retient tout le monde tant que rien n’est saisi, le CRA valant constat', () => {
    const usagers = usagersPourActivite(
      rdvAvec([participation('unknown', 7), participation('unknown', 8)]),
    )

    expect(usagers.map(({ id }) => id)).toEqual([7, 8])
  })
})

describe('verifierRdv', () => {
  it('autorise le propriétaire du rendez-vous', () => {
    const verifie = verifierRdv({ rdv: rdvAvec([]), compte, rdvId })

    expect(verifie.success).toBe(true)
  })

  it('refuse un rendez-vous rattaché à un autre agent', () => {
    const verifie = verifierRdv({
      rdv: { ...rdvAvec([]), agentId: RdvAgentId(9999) },
      compte,
      rdvId,
    })

    expect(verifie.success === false && verifie.error._tag).toBe(
      'RdvNonAutorise',
    )
  })

  it('refuse un rendez-vous inconnu de La Coop', () => {
    const verifie = verifierRdv({ rdv: null, compte, rdvId })

    expect(verifie.success === false && verifie.error._tag).toBe(
      'RdvIntrouvable',
    )
  })

  it('refuse un médiateur sans compte RDV', () => {
    const verifie = verifierRdv({ rdv: rdvAvec([]), compte: null, rdvId })

    expect(verifie.success === false && verifie.error._tag).toBe('CompteNonLie')
  })

  it('refuse avant même de considérer le rendez-vous quand le compte est délié', () => {
    const verifie = verifierRdv({
      rdv: null,
      compte: {
        ...compte,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      },
      rdvId,
    })

    expect(verifie.success === false && verifie.error._tag).toBe('CompteNonLie')
  })
})
