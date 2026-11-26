import {
  Adresse,
  Contact,
  DispositifProgrammeNational,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Horaires,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { differences, sectionsConcernees } from './differences'
import type { Fiche } from './fiche'

const fiche: Fiche = {
  nom: Nom('Espace numérique'),
  pivot: null,
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
  }),
  localisation: null,
  typologies: Typologies([]),
  contact: Contact({}),
  horaires: Horaires('Mo 09:00-12:00'),
  presentation: null,
  services: Services([
    Service.AideAuxDemarchesAdministratives,
    Service.ComprehensionDuMondeNumerique,
  ]),
  publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
  priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
  modalitesAcces: ModalitesAcces([]),
  fraisACharge: FraisACharge([]),
  itinerance: Itinerances([]),
  dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
  formationsLabels: FormationsLabels([]),
  autresFormationsLabels: [],
  modalitesAccompagnement: ModalitesAccompagnement([]),
  ficheAccesLibre: null,
  priseRdv: null,
}

describe('différences entre la fiche de la coop et celle du registre', () => {
  it('ne signale rien entre deux fiches identiques', () => {
    expect(differences(fiche, { ...fiche })).toEqual([])
  })

  it('signale un champ dont la valeur a changé', () => {
    const repris = { ...fiche, nom: Nom('Tiers-lieu du Port') }

    expect(differences(fiche, repris)).toMatchObject([{ champ: 'nom' }])
  })

  it('signale une information EFFACÉE par l’autre source', () => {
    const sansHoraires = { ...fiche, horaires: null }

    expect(differences(fiche, sansHoraires)).toMatchObject([
      { champ: 'horaires' },
    ])
  })

  it('ne voit pas de différence dans un ordre de liste différent', () => {
    const memesServices = {
      ...fiche,
      services: Services([
        Service.ComprehensionDuMondeNumerique,
        Service.AideAuxDemarchesAdministratives,
      ]),
    }

    expect(differences(fiche, memesServices)).toEqual([])
  })

  it('compare les objets sur leur contenu, pas sur leur identité', () => {
    const memeContact = { ...fiche, contact: Contact({}) }

    expect(differences(fiche, memeContact)).toEqual([])
  })

  it('ne propose jamais de reprendre l’adresse d’une autre source', () => {
    const ailleurs = {
      ...fiche,
      adresse: Adresse({
        voie: '3 avenue de la Gare',
        commune: 'Reims',
        code_postal: '51100',
      }),
    }

    expect(differences(fiche, ailleurs)).toEqual([])
  })

  it('ignore ce qu’aucun formulaire de la coop ne sait écrire', () => {
    const enrichi = {
      ...fiche,
      dispositifProgrammesNationaux: DispositifProgrammesNationaux([
        DispositifProgrammeNational.AidantsConnect,
      ]),
      autresFormationsLabels: ['Label maison'],
    }

    expect(differences(fiche, enrichi)).toEqual([])
  })

  it('rend de quoi présenter le choix : les deux valeurs et leur section', () => {
    const repris = { ...fiche, horaires: Horaires('Tu 14:00-18:00') }

    expect(differences(fiche, repris)).toEqual([
      {
        champ: 'horaires',
        libelle: 'Horaires',
        section: 'InformationsPratiques',
        coop: 'Mo 09:00-12:00',
        registre: 'Tu 14:00-18:00',
      },
    ])
  })
})

describe('sections concernées par les différences', () => {
  it('nomme une seule fois chaque section où la fiche diffère', () => {
    const repris = {
      ...fiche,
      nom: Nom('Tiers-lieu du Port'),
      contact: Contact({ telephone: '+33180059880' }),
      horaires: null,
    }

    expect(sectionsConcernees(differences(fiche, repris))).toEqual([
      'InformationsGenerales',
      'InformationsPratiques',
    ])
  })
})
