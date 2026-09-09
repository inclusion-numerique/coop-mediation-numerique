import {
  Adresse,
  Contact,
  DispositifProgrammeNational,
  Nom,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { Fiche } from '../../../domain/fiche'
import { differences } from './differences'

const fiche: Fiche = {
  nom: Nom('Espace numérique'),
  pivot: null,
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
  }),
  localisation: null,
  typologies: [],
  contact: Contact({}),
  horaires: 'Mo 09:00-12:00',
  presentation: null,
  services: [
    Service.AideAuxDemarchesAdministratives,
    Service.ComprehensionDuMondeNumerique,
  ],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  modalitesAcces: [],
  fraisACharge: [],
  itinerance: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  modalitesAccompagnement: [],
  ficheAccesLibre: null,
  priseRdv: null,
}

const champs = (unes: Fiche, autres: Fiche) =>
  differences(unes, autres).map(({ champ }) => champ)

describe('différences entre la fiche de la coop et celle du registre', () => {
  it('ne signale rien entre deux fiches identiques', () => {
    expect(differences(fiche, { ...fiche })).toEqual([])
  })

  it('signale un champ dont la valeur a changé', () => {
    const repris = { ...fiche, nom: Nom('Tiers-lieu du Port') }

    expect(champs(fiche, repris)).toEqual(['nom'])
  })

  it('signale une information EFFACÉE par l’autre source', () => {
    // Le cas qui compte : le registre ne dit plus rien d'un champ que la coop
    // renseignait. Sans lui, la disparition passerait inaperçue.
    const sansHoraires = { ...fiche, horaires: null }

    expect(champs(fiche, sansHoraires)).toEqual(['horaires'])
  })

  it('ne voit pas de différence dans un ordre de liste différent', () => {
    const memesServices = {
      ...fiche,
      services: [
        Service.ComprehensionDuMondeNumerique,
        Service.AideAuxDemarchesAdministratives,
      ],
    }

    expect(differences(fiche, memesServices)).toEqual([])
  })

  it('compare les objets sur leur contenu, pas sur leur identité', () => {
    const memeAdresse = {
      ...fiche,
      adresse: Adresse({
        voie: '12 rue de la Paix',
        commune: 'Reims',
        code_postal: '51100',
      }),
    }

    expect(differences(fiche, memeAdresse)).toEqual([])
  })

  it('ignore ce qu’aucun formulaire de la coop ne sait écrire', () => {
    // Les proposer au choix reviendrait à offrir d'effacer ce que la coop n'a
    // jamais su dire — précisément ce qu'on vient d'interdire à l'écriture.
    const enrichi = {
      ...fiche,
      dispositifProgrammesNationaux: [
        DispositifProgrammeNational.AidantsConnect,
      ],
      autresFormationsLabels: ['Label maison'],
    }

    expect(differences(fiche, enrichi)).toEqual([])
  })

  it('rend de quoi présenter le choix : les deux valeurs et leur section', () => {
    const repris = { ...fiche, horaires: 'Tu 14:00-18:00' }

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
