import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { RdvId } from '../../../domain/identifiants/rdv-id'
import { UsagerId } from '../../../domain/identifiants/usager-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { NomExterne, PrenomExterne } from '../../../domain/identite'
import { StatutPresence } from '../../../domain/rdv/statut-presence'
import { creerActiviteDepuisRdv } from './creer-activite-depuis-rdv'
import type { CreerActiviteDepuisRdvPorts } from './ports'
import type {
  ParticipationDuRdv,
  RdvPourActivite,
  UsagerDuRdv,
} from './rdv-pour-activite'

const agentId = RdvAgentId(4242)
const rdvId = RdvId(77)
const urlCreationCra = '/coop/mes-activites/creer/accompagnement?v=1'

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

const usager = (id: number): UsagerDuRdv => ({
  id: UsagerId(id),
  prenom: PrenomExterne('Jean'),
  nom: NomExterne('Dupont'),
  email: null,
  telephone: null,
  adresse: null,
  dateNaissance: null,
})

const participation = (
  statut: StatutPresence,
  usagerId: number,
): ParticipationDuRdv => ({
  statutPresence: statut,
  usager: usager(usagerId),
})

const rdvAvec = (
  participations: readonly ParticipationDuRdv[],
  statutDuRdv: StatutPresence,
): RdvPourActivite => ({
  id: rdvId,
  agentId,
  statutPresence: statutDuRdv,
  participations,
  debut: new Date('2026-11-10T09:00:00.000Z'),
  dureeEnMinutes: 60,
  titre: null,
  collectif: false,
})

const vu = StatutPresence('seen')
const inconnu = StatutPresence('unknown')

const ports: CreerActiviteDepuisRdvPorts = {
  lireRdv: async () => rdvAvec([participation(vu, 1)], inconnu),
  compteDuRedacteur: async () => compte,
  creerOuFusionnerBeneficiaires: async () => success({ merges: [] }),
  preparerUrlCreationCra: async () => urlCreationCra,
}

const demande = {
  utilisateurId: compte.utilisateurId,
  mediateurId: MediateurId('b6f1a6a2-3c4d-4e5f-8a9b-0c1d2e3f4a5b'),
  rdvId,
  maintenant: new Date('2026-11-12T10:00:00.000Z'),
}

const preparerPour = (rdv: RdvPourActivite) =>
  creerActiviteDepuisRdv({ ...ports, lireRdv: async () => rdv })(demande)

describe('créer une activité depuis un rendez-vous', () => {
  it('rend au propriétaire du rendez-vous le lien vers le CRA pré-rempli, avec les participants présents', async () => {
    expect(await creerActiviteDepuisRdv(ports)(demande)).toEqual(
      success({ usagers: [usager(1)], urlCreationCra }),
    )
  })

  it('retient ceux dont la présence n’a pas encore été saisie', async () => {
    expect(
      await preparerPour(rdvAvec([participation(inconnu, 2)], inconnu)),
    ).toEqual(success({ usagers: [usager(2)], urlCreationCra }))
  })

  it.each<{ statut: StatutPresence }>([
    { statut: StatutPresence('excused') },
    { statut: StatutPresence('revoked') },
    { statut: StatutPresence('noshow') },
  ])(
    'écarte un participant « $statut », qui n’a pas été rencontré',
    async ({ statut }) => {
      expect(
        await preparerPour(rdvAvec([participation(statut, 3)], inconnu)),
      ).toEqual(success({ usagers: [], urlCreationCra }))
    },
  )

  it('ne garde que les présents d’un atelier partiellement honoré', async () => {
    expect(
      await preparerPour(
        rdvAvec(
          [
            participation(vu, 1),
            participation(StatutPresence('noshow'), 2),
            participation(inconnu, 3),
            participation(StatutPresence('excused'), 4),
          ],
          vu,
        ),
      ),
    ).toEqual(success({ usagers: [usager(1), usager(3)], urlCreationCra }))
  })

  it.each<{ statutDuRdv: StatutPresence }>([
    { statutDuRdv: StatutPresence('excused') },
    { statutDuRdv: StatutPresence('revoked') },
    { statutDuRdv: StatutPresence('noshow') },
  ])(
    'écarte une participation non saisie d’un rendez-vous « $statutDuRdv », seul statut que La Coop écrit',
    async ({ statutDuRdv }) => {
      expect(
        await preparerPour(rdvAvec([participation(inconnu, 5)], statutDuRdv)),
      ).toEqual(success({ usagers: [], urlCreationCra }))
    },
  )

  it('retient une participation explicitement présente sur un rendez-vous annulé', async () => {
    expect(
      await preparerPour(
        rdvAvec([participation(vu, 6)], StatutPresence('revoked')),
      ),
    ).toEqual(success({ usagers: [usager(6)], urlCreationCra }))
  })

  it('retient tout le monde tant que rien n’est saisi, le CRA valant constat', async () => {
    expect(
      await preparerPour(
        rdvAvec(
          [participation(inconnu, 7), participation(inconnu, 8)],
          inconnu,
        ),
      ),
    ).toEqual(success({ usagers: [usager(7), usager(8)], urlCreationCra }))
  })

  it('refuse un rendez-vous rattaché à un autre agent', async () => {
    expect(
      await preparerPour({
        ...rdvAvec([], inconnu),
        agentId: RdvAgentId(9999),
      }),
    ).toEqual(failure({ _tag: 'RdvNonAutorise', rdvId }))
  })

  it('refuse un rendez-vous inconnu de La Coop', async () => {
    const resultat = await creerActiviteDepuisRdv({
      ...ports,
      lireRdv: async () => null,
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'RdvIntrouvable', id: rdvId }))
  })

  it('refuse un médiateur sans compte RDV', async () => {
    const resultat = await creerActiviteDepuisRdv({
      ...ports,
      compteDuRedacteur: async () => null,
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId: null }))
  })

  it('refuse avant même de considérer le rendez-vous quand le compte est délié', async () => {
    const resultat = await creerActiviteDepuisRdv({
      ...ports,
      lireRdv: async () => null,
      compteDuRedacteur: async () => ({
        ...compte,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      }),
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'CompteNonLie', agentId }))
  })
})
