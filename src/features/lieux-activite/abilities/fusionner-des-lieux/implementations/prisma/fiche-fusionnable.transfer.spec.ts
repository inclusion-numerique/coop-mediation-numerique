import {
  Contact,
  Courriel,
  DispositifProgrammesNationaux,
  FormationsLabels,
  FraisACharge,
  Itinerances,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PrisesEnChargeSpecifiques,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { VisibiliteCartographie } from '../../../../domain/cartographie-nationale/visibilite-cartographie'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { ModificationInconnue } from '../../../../domain/registre/tracabilite'
import { lieuFromDomain } from '../../../../implementations/prisma/lieu.transfer'
import type { FicheFusionnable } from '../../domain'
import {
  colonnesDeLaFicheFusionnee,
  ficheFusionnableToDomain,
} from './fiche-fusionnable.transfer'

const fiche: FicheFusionnable = {
  lieu: {
    id: LieuId('550e8400-e29b-41d4-a716-446655440000'),
    fiche: {
      nom: Nom('Espace numérique'),
      pivot: null,
      adresse: null,
      localisation: null,
      typologies: Typologies([Typologie.BIB]),
      contact: Contact({ courriels: [Courriel('contact@example.fr')] }),
      horaires: null,
      presentation: null,
      services: Services([Service.AideAuxDemarchesAdministratives]),
      publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([]),
      priseEnChargeSpecifique: PrisesEnChargeSpecifiques([]),
      modalitesAcces: ModalitesAcces([]),
      fraisACharge: FraisACharge([]),
      itinerance: Itinerances([]),
      dispositifProgrammesNationaux: DispositifProgrammesNationaux([]),
      formationsLabels: FormationsLabels([]),
      autresFormationsLabels: ['Label local'],
      modalitesAccompagnement: ModalitesAccompagnement([]),
      ficheAccesLibre: null,
      priseRdv: null,
    },
    visibilite: VisibiliteCartographie('Publie'),
    idsCartographieNationale: null,
    banId: null,
    identiteSirene: { nomUsage: null, synchronisation: null },
    tracabilite: {
      creation: { date: new Date('2026-01-15T09:00:00Z'), par: null },
      derniereModification: ModificationInconnue(
        new Date('2026-08-20T14:30:00Z'),
      ),
      suppression: { _tag: 'Actif' },
    },
  },
  heritage: {
    nomReferent: 'Référente',
    courrielReferent: 'referente@example.fr',
    telephoneReferent: '0102030405',
    v1Imported: new Date('2023-01-01T00:00:00Z'),
    v1StructureId: 'structure-v1',
    v1StructureIdPg: 12,
    v1PermanenceId: 'permanence-v1',
  },
}

describe('la fiche à fusionner, entre la base et le domaine', () => {
  it('se relit telle qu’elle a été écrite', () => {
    expect(
      ficheFusionnableToDomain({
        ...lieuFromDomain(fiche.lieu),
        ...fiche.heritage,
        structureParente: null,
        rna: null,
        activitesCount: 0,
        inscriptionRegistre: null,
      }),
    ).toEqual(fiche)
  })

  it('n’écrit que ce que la fusion décide', () => {
    expect(colonnesDeLaFicheFusionnee(fiche)).toEqual({
      typologies: ['BIB'],
      services: ['AideAuxDemarchesAdministratives'],
      publicsSpecifiquementAdresses: [],
      priseEnChargeSpecifique: [],
      fraisACharge: [],
      dispositifProgrammesNationaux: [],
      formationsLabels: [],
      autresFormationsLabels: ['Label local'],
      itinerance: [],
      modalitesAcces: [],
      modalitesAccompagnement: [],
      courriels: ['contact@example.fr'],
      visiblePourCartographieNationale: true,
      ...fiche.heritage,
    })
  })
})
