import { describe, expect, it } from 'vitest'
import { RdvAgentId } from '../../domain/identifiants/rdv-agent-id'
import { rdvPayload } from './rdv-service-public.payload'
import { rdvToDomain } from './rdv-service-public.transfer'

const payloadsRdvCaptures = [
  {
    id: 36944,
    lieu: {
      id: 1461,
      name: 'Lieu d’exemple 1',
      address: '1 rue de l’Exemple, 75001 Paris',
      single_use: false,
      phone_number: '01 02 03 04 05',
      organisation_id: 878,
    },
    name: null,
    uuid: '7e2661b1-af6c-4602-a16e-72935fcbbac4',
    motif: {
      id: 2350,
      name: 'Suivi de dossier',
      collectif: false,
      follow_up: false,
      location_type: 'public_office',
      motif_category: null,
      organisation_id: 878,
      instruction_for_rdv: 'Instruction d’exemple',
    },
    status: 'seen',
    address: '1 rue de l’Exemple, 75001 Paris',
    context: '',
    ends_at: '2026-08-19T15:30:00.000Z',
    collectif: false,
    starts_at: '2026-08-19T15:00:00.000Z',
    users_count: 1,
    cancelled_at: null,
    organisation: {
      id: 878,
      name: 'Organisation d’exemple',
      email: null,
      verticale: 'rdv_mairie',
      phone_number: null,
    },
    created_by_id: 2732,
    participations: [
      {
        id: 37515,
        user: {
          id: 10231,
          email: 'usager1@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:49:13.000Z',
          first_name: 'Usager1',
          phone_number: '+33600000001',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 01',
        },
        status: 'seen',
        send_reminder_notification: true,
        send_lifecycle_notifications: true,
      },
    ],
    url_for_agents: 'https://demo.rdv.anct.gouv.fr/agents/rdvs/36944',
    duration_in_min: 30,
    max_participants_count: null,
  },
  {
    id: 36945,
    lieu: {
      id: 1461,
      name: 'Lieu d’exemple 1',
      address: '1 rue de l’Exemple, 75001 Paris',
      single_use: false,
      phone_number: '01 02 03 04 05',
      organisation_id: 878,
    },
    name: null,
    uuid: '5ca9fcd1-9122-4cf9-8b25-d4c71425940c',
    motif: {
      id: 2579,
      name: 'Atelier collectif',
      collectif: true,
      follow_up: false,
      location_type: 'public_office',
      motif_category: null,
      organisation_id: 878,
      instruction_for_rdv: 'Instruction d’exemple',
    },
    status: 'revoked',
    address: '1 rue de l’Exemple, 75001 Paris',
    context: '',
    ends_at: '2026-08-20T08:30:00.000Z',
    collectif: true,
    starts_at: '2026-08-20T08:00:00.000Z',
    users_count: 0,
    cancelled_at: '2026-08-19T12:37:07.000Z',
    organisation: {
      id: 878,
      name: 'Organisation d’exemple',
      email: null,
      verticale: 'rdv_mairie',
      phone_number: null,
    },
    created_by_id: 2732,
    participations: [
      {
        id: 37517,
        user: {
          id: 10231,
          email: 'usager1@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:49:13.000Z',
          first_name: 'Usager1',
          phone_number: '+33600000001',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 01',
        },
        status: 'revoked',
        send_reminder_notification: true,
        send_lifecycle_notifications: true,
      },
      {
        id: 37516,
        user: {
          id: 10232,
          email: 'usager2@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:50:46.000Z',
          first_name: 'Usager2',
          phone_number: '+33600000002',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 02',
        },
        status: 'revoked',
        send_reminder_notification: true,
        send_lifecycle_notifications: true,
      },
    ],
    url_for_agents: 'https://demo.rdv.anct.gouv.fr/agents/rdvs/36945',
    duration_in_min: 30,
    max_participants_count: null,
  },
  {
    id: 36946,
    lieu: {
      id: 1461,
      name: 'Lieu d’exemple 1',
      address: '1 rue de l’Exemple, 75001 Paris',
      single_use: false,
      phone_number: '01 02 03 04 05',
      organisation_id: 878,
    },
    name: null,
    uuid: 'cca026ad-db6d-425f-99ee-1c72edc40e3f',
    motif: {
      id: 2350,
      name: 'Suivi de dossier',
      collectif: false,
      follow_up: false,
      location_type: 'public_office',
      motif_category: null,
      organisation_id: 878,
      instruction_for_rdv: 'Instruction d’exemple',
    },
    status: 'excused',
    address: '1 rue de l’Exemple, 75001 Paris',
    context: null,
    ends_at: '2026-08-21T12:45:00.000Z',
    collectif: false,
    starts_at: '2026-08-21T12:00:00.000Z',
    users_count: 0,
    cancelled_at: '2026-08-19T14:00:49.000Z',
    organisation: {
      id: 878,
      name: 'Organisation d’exemple',
      email: null,
      verticale: 'rdv_mairie',
      phone_number: null,
    },
    created_by_id: 2732,
    participations: [
      {
        id: 37518,
        user: {
          id: 10231,
          email: 'usager1@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:49:13.000Z',
          first_name: 'Usager1',
          phone_number: '+33600000001',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 01',
        },
        status: 'excused',
        send_reminder_notification: false,
        send_lifecycle_notifications: false,
      },
    ],
    url_for_agents: 'https://demo.rdv.anct.gouv.fr/agents/rdvs/36946',
    duration_in_min: 45,
    max_participants_count: null,
  },
  {
    id: 36947,
    lieu: {
      id: 1461,
      name: 'Lieu d’exemple 1',
      address: '1 rue de l’Exemple, 75001 Paris',
      single_use: false,
      phone_number: '01 02 03 04 05',
      organisation_id: 878,
    },
    name: null,
    uuid: '01b15c88-38b0-4942-a2dd-416dc7db6022',
    motif: {
      id: 2579,
      name: 'Atelier collectif',
      collectif: true,
      follow_up: false,
      location_type: 'public_office',
      motif_category: null,
      organisation_id: 878,
      instruction_for_rdv: 'Instruction d’exemple',
    },
    status: 'unknown',
    address: '1 rue de l’Exemple, 75001 Paris',
    context: null,
    ends_at: '2026-08-24T10:00:00.000Z',
    collectif: true,
    starts_at: '2026-08-24T09:00:00.000Z',
    users_count: 1,
    cancelled_at: null,
    organisation: {
      id: 878,
      name: 'Organisation d’exemple',
      email: null,
      verticale: 'rdv_mairie',
      phone_number: null,
    },
    created_by_id: 2732,
    participations: [
      {
        id: 37519,
        user: {
          id: 10231,
          email: 'usager1@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:49:13.000Z',
          first_name: 'Usager1',
          phone_number: '+33600000001',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 01',
        },
        status: 'unknown',
        send_reminder_notification: false,
        send_lifecycle_notifications: false,
      },
    ],
    url_for_agents: 'https://demo.rdv.anct.gouv.fr/agents/rdvs/36947',
    duration_in_min: 60,
    max_participants_count: null,
  },
  {
    id: 36948,
    lieu: {
      id: 1461,
      name: 'Lieu d’exemple 1',
      address: '1 rue de l’Exemple, 75001 Paris',
      single_use: false,
      phone_number: '01 02 03 04 05',
      organisation_id: 878,
    },
    name: null,
    uuid: '84ecce46-47e1-4abf-9655-dc6ba7e03cf7',
    motif: {
      id: 2350,
      name: 'Suivi de dossier',
      collectif: false,
      follow_up: false,
      location_type: 'public_office',
      motif_category: null,
      organisation_id: 878,
      instruction_for_rdv: 'Instruction d’exemple',
    },
    status: 'seen',
    address: '1 rue de l’Exemple, 75001 Paris',
    context: null,
    ends_at: '2026-08-19T15:00:00.000Z',
    collectif: false,
    starts_at: '2026-08-19T14:30:00.000Z',
    users_count: 1,
    cancelled_at: null,
    organisation: {
      id: 878,
      name: 'Organisation d’exemple',
      email: null,
      verticale: 'rdv_mairie',
      phone_number: null,
    },
    created_by_id: 2732,
    participations: [
      {
        id: 37520,
        user: {
          id: 10232,
          email: 'usager2@example.org',
          address: null,
          last_name: 'EXEMPLE',
          birth_date: null,
          birth_name: null,
          created_at: '2026-08-19T09:50:46.000Z',
          first_name: 'Usager2',
          phone_number: '+33600000002',
          notify_by_sms: true,
          responsible_id: null,
          address_details: null,
          notify_by_email: true,
          affiliation_number: null,
          caisse_affiliation: null,
          invitation_created_at: null,
          invitation_accepted_at: null,
          phone_number_formatted: '06 00 00 00 02',
        },
        status: 'seen',
        send_reminder_notification: false,
        send_lifecycle_notifications: false,
      },
    ],
    url_for_agents: 'https://demo.rdv.anct.gouv.fr/agents/rdvs/36948',
    duration_in_min: 30,
    max_participants_count: null,
  },
] as const

const AGENT_ID = RdvAgentId(2732)

describe('payloads réels de RDV Service Public', () => {
  it.each(payloadsRdvCaptures.map((payload) => [payload.id, payload] as const))(
    'le rendez-vous %s est accepté par le schéma',
    (_id, payload) => {
      const analyse = rdvPayload.safeParse(payload)

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

    expect(texte).not.toMatch(/@(?!example\.org)[\w.-]+\.[a-z]{2,}/i)
    expect(texte).not.toMatch(/\+33(?!600000)\d{9}/)
  })
})
