import { describe, expect, it } from 'vitest'
import { encodeSerializableState } from '@/libraries/etat-encode'
import {
  dureeDepuisLesMinutes,
  dureePersonnaliseeDepuisLesMinutes,
} from '../../forms/saisie/duree.form-data'
import { cheminDeSaisieDepuisUnRendezVous } from './url-de-saisie-depuis-un-rendez-vous.presenter'

const rendezVous = {
  id: 4242,
  debut: new Date('2026-11-10T09:00:00.000Z'),
  dureeEnMinutes: 60,
  titre: 'Atelier e-mail',
  collectif: false,
}

const camille = {
  id: 'e0000000-0000-4000-8000-000000000001',
  prenom: 'Camille',
  nom: 'Martin',
}

describe('saisie depuis un rendez-vous', () => {
  it('préremplit un accompagnement individuel avec une durée proposée', () => {
    expect(
      cheminDeSaisieDepuisUnRendezVous({
        rendezVous,
        participants: [camille],
        dureesProposees: [{ value: '30' }, { value: '60' }],
      }),
    ).toBe(
      `/coop/mes-activites/cra/individuel?v=${encodeSerializableState({
        date: '2026-11-10',
        duree: dureeDepuisLesMinutes(60) ?? undefined,
        rdvServicePublicId: 4242,
        beneficiaire: camille,
      })}`,
    )
  })

  it('préremplit un atelier avec une durée personnalisée', () => {
    expect(
      cheminDeSaisieDepuisUnRendezVous({
        rendezVous: { ...rendezVous, collectif: true, dureeEnMinutes: 75 },
        participants: [camille],
        dureesProposees: [{ value: '60' }],
      }),
    ).toBe(
      `/coop/mes-activites/cra/collectif?v=${encodeSerializableState({
        date: '2026-11-10',
        duree: dureePersonnaliseeDepuisLesMinutes(75),
        rdvServicePublicId: 4242,
        titreAtelier: 'Atelier e-mail',
        participants: [camille],
      })}`,
    )
  })
})
