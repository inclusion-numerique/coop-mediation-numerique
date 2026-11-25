import {
  Adresse,
  ComplementAdresse,
  Courriel,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { IdentifiantCartographie } from '../../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { LieuAFusionner } from '../../domain'
import type { LieuAFusionnerRow } from './lieu-a-fusionner.select'
import { lieuAFusionnerToDomain } from './lieu-a-fusionner.transfer'

const creation = new Date('2026-01-15T09:00:00.000Z')

const ligne: LieuAFusionnerRow = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  creation,
  creationParId: null,
  modification: creation,
  derniereModificationParId: null,
  derniereModificationSource: null,
  suppression: null,
  suppressionParId: null,
  nom: 'Espace numérique',
  adresse: '12 rue de la Paix',
  commune: 'Reims',
  codePostal: '51100',
  codeInsee: '51454',
  complementAdresse: null,
  latitude: null,
  longitude: null,
  banId: null,
  siret: null,
  rna: null,
  nomUsage: null,
  synchronisationSiret: null,
  visiblePourCartographieNationale: false,
  typologies: [],
  presentationResume: null,
  presentationDetail: null,
  siteWeb: [],
  telephone: null,
  courriels: [],
  ficheAccesLibre: null,
  horaires: null,
  priseRdv: null,
  structureParente: null,
  services: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  fraisACharge: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  itinerance: [],
  modalitesAcces: [],
  modalitesAccompagnement: [],
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
  v1Imported: null,
  v1StructureId: null,
  v1StructureIdPg: null,
  v1PermanenceId: null,
  activitesCount: 0,
  inscriptionRegistre: null,
  mediateursEnActivite: [],
  activites: [],
}

const sansRelation = { employesIds: [], activitesEmployeurIds: [] }

const minimal: LieuAFusionner = {
  id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
  nom: Nom('Espace numérique'),
  adresse: Adresse({
    voie: '12 rue de la Paix',
    commune: 'Reims',
    code_postal: '51100',
    code_insee: '51454',
  }),
  siret: null,
  rna: null,
  structureCartographieNationaleId: null,
  typologies: [],
  services: [],
  publicsSpecifiquementAdresses: [],
  priseEnChargeSpecifique: [],
  fraisACharge: [],
  dispositifProgrammesNationaux: [],
  formationsLabels: [],
  autresFormationsLabels: [],
  itinerance: [],
  modalitesAcces: [],
  modalitesAccompagnement: [],
  courriels: [],
  employesIds: [],
  mediateursEnActiviteIds: [],
  activitesEmployeurIds: [],
  activitesLieuIds: [],
}

describe('lieu à fusionner lu en base', () => {
  it('lit un lieu sans relation', () => {
    expect(lieuAFusionnerToDomain(ligne, sansRelation)).toEqual(minimal)
  })

  it('garde l’adresse d’un lieu sans code INSEE', () => {
    expect(
      lieuAFusionnerToDomain({ ...ligne, codeInsee: null }, sansRelation)
        .adresse,
    ).toEqual(
      Adresse({
        voie: '12 rue de la Paix',
        commune: 'Reims',
        code_postal: '51100',
      }),
    )
  })

  it('lit un lieu inscrit au registre, avec ses champs partageables', () => {
    expect(
      lieuAFusionnerToDomain(
        {
          ...ligne,
          complementAdresse: 'Bâtiment B',
          siret: '55217862900135',
          rna: 'W511234567',
          typologies: ['BIB'],
          services: ['AideAuxDemarchesAdministratives'],
          publicsSpecifiquementAdresses: ['Jeunes'],
          priseEnChargeSpecifique: ['Surdite'],
          fraisACharge: ['Gratuit'],
          dispositifProgrammesNationaux: ['FranceServices'],
          formationsLabels: ['EtapesNumeriques'],
          autresFormationsLabels: ['Label local'],
          itinerance: ['Fixe'],
          modalitesAcces: ['SePresenter'],
          modalitesAccompagnement: ['EnAutonomie'],
          courriels: ['contact@example.fr'],
          inscriptionRegistre: { structureCartographieNationaleId: 'carto-42' },
          mediateursEnActivite: [
            { mediateurId: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8' },
          ],
          activites: [{ id: 'a1b2c3d4-e5f6-4789-8abc-def012345678' }],
        },
        {
          employesIds: ['b2c3d4e5-f6a7-4890-9bcd-ef0123456789'],
          activitesEmployeurIds: ['c3d4e5f6-a7b8-4901-8cde-f01234567890'],
        },
      ),
    ).toEqual({
      ...minimal,
      adresse: Adresse({
        voie: '12 rue de la Paix',
        commune: 'Reims',
        code_postal: '51100',
        code_insee: '51454',
        complement_adresse: ComplementAdresse('Bâtiment B'),
      }),
      siret: '55217862900135',
      rna: 'W511234567',
      structureCartographieNationaleId: IdentifiantCartographie('carto-42'),
      typologies: ['BIB'],
      services: ['AideAuxDemarchesAdministratives'],
      publicsSpecifiquementAdresses: ['Jeunes'],
      priseEnChargeSpecifique: ['Surdite'],
      fraisACharge: ['Gratuit'],
      dispositifProgrammesNationaux: ['FranceServices'],
      formationsLabels: ['EtapesNumeriques'],
      autresFormationsLabels: ['Label local'],
      itinerance: ['Fixe'],
      modalitesAcces: ['SePresenter'],
      modalitesAccompagnement: ['EnAutonomie'],
      courriels: [Courriel('contact@example.fr')],
      employesIds: ['b2c3d4e5-f6a7-4890-9bcd-ef0123456789'],
      mediateursEnActiviteIds: [
        MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8'),
      ],
      activitesEmployeurIds: ['c3d4e5f6-a7b8-4901-8cde-f01234567890'],
      activitesLieuIds: ['a1b2c3d4-e5f6-4789-8abc-def012345678'],
    } satisfies LieuAFusionner)
  })

  it('lit une inscription au registre sans identifiant cartographie', () => {
    expect(
      lieuAFusionnerToDomain(
        {
          ...ligne,
          inscriptionRegistre: { structureCartographieNationaleId: null },
        },
        sansRelation,
      ).structureCartographieNationaleId,
    ).toBeNull()
  })

  it.each([
    ['un identifiant', { ...ligne, id: 'pas-un-identifiant' }],
    ['un nom', { ...ligne, nom: '   ' }],
    ['un courriel', { ...ligne, courriels: ['pas un courriel'] }],
    [
      'un médiateur',
      { ...ligne, mediateursEnActivite: [{ mediateurId: 'pas-un-id' }] },
    ],
  ])('rejette %s illisible', (_, illisible) => {
    expect(() => lieuAFusionnerToDomain(illisible, sansRelation)).toThrow()
  })
})
