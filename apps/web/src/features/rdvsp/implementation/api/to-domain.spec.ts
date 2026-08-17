import { RdvAgentId } from '../../domain/rdv-agent-id'
import { rdvPayload } from './payloads'
import { rdvToDomain } from './to-domain'

const agentId = RdvAgentId(4242)

/**
 * Payload complet tel que RDV Service Public le renvoie sur `/rdvs`. Il traverse
 * le schéma Zod avant le mapping : ce que ce test prouve, c'est que le contrat du
 * port porte tout ce que la synchronisation doit persister — motif, lieu et
 * usagers — et non seulement de quoi afficher un rendez-vous.
 */
const payloadComplet = {
  id: 1,
  uuid: '0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b',
  address: '12 rue de la Paix, 75002 Paris',
  starts_at: '2026-08-18T09:00:00.000Z',
  ends_at: '2026-08-18T10:00:00.000Z',
  duration_in_min: 60,
  status: 'unknown',
  url_for_agents: 'https://rdv.anct.gouv.fr/admin/rdvs/1',
  cancelled_at: null,
  collectif: false,
  name: null,
  max_participants_count: null,
  organisation: {
    id: 7,
    name: 'Médiathèque',
    email: null,
    phone_number: null,
    verticale: null,
  },
  motif: {
    id: 3,
    name: 'Accompagnement numérique',
    collectif: false,
    organisation_id: 7,
    follow_up: true,
    instruction_for_rdv: 'Apportez votre pièce d’identité',
    location_type: 'public_office',
    motif_category: { id: 12 },
  },
  lieu: {
    id: 11,
    name: 'Médiathèque centrale',
    address: '1 place du Marché, 44000 Nantes',
    organisation_id: 7,
    phone_number: '+33240000000',
    single_use: false,
  },
  participations: [
    {
      id: 100,
      status: 'seen',
      send_reminder_notification: true,
      send_lifecycle_notifications: false,
      user: {
        id: 200,
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@example.com',
        phone_number: '+33600000000',
        phone_number_formatted: null,
        birth_date: '1980-05-12',
        address: '3 rue des Lilas',
        address_details: 'Bâtiment B',
        affiliation_number: null,
        caisse_affiliation: null,
        birth_name: null,
        responsible_id: null,
        notify_by_email: true,
        notify_by_sms: false,
      },
    },
  ],
}

describe('rdvToDomain', () => {
  const rdv = rdvToDomain(rdvPayload.parse(payloadComplet), agentId)

  it('porte le paramétrage complet du motif', () => {
    expect(rdv.motif).toEqual({
      id: 3,
      nom: 'Accompagnement numérique',
      collectif: false,
      organisationId: 7,
      suivi: true,
      instruction: 'Apportez votre pièce d’identité',
      typeDeLieu: 'public_office',
      categorieId: 12,
    })
  })

  it('porte le lieu', () => {
    expect(rdv.lieu).toEqual({
      id: 11,
      nom: 'Médiathèque centrale',
      adresse: '1 place du Marché, 44000 Nantes',
      organisationId: 7,
      telephone: '+33240000000',
      usageUnique: false,
    })
  })

  it('porte l’usager entier de chaque participation', () => {
    const usager = rdv.participations.at(0)?.usager

    expect(usager?.id).toBe(200)
    expect(usager?.prenom).toBe('Jean')
    expect(usager?.email).toBe('jean.dupont@example.com')
    expect(usager?.dateNaissance).toEqual(new Date('1980-05-12'))
    expect(usager?.coordonnees.complementAdresse).toBe('Bâtiment B')
  })

  it('accepte un rendez-vous sans motif ni lieu', () => {
    const sansEntourage = rdvToDomain(
      rdvPayload.parse({ ...payloadComplet, motif: null, lieu: null }),
      agentId,
    )

    expect(sansEntourage.motif).toBeNull()
    expect(sansEntourage.lieu).toBeNull()
  })

  it('rattache le rendez-vous au compte qui l’a demandé', () => {
    expect(rdv.agentId).toBe(agentId)
  })
})
