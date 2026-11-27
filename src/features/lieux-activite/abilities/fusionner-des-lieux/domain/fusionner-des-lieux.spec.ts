import {
  Contact,
  Courriel,
  DispositifProgrammeNational,
  DispositifProgrammesNationaux,
  FormationLabel,
  FormationsLabels,
  Frais,
  FraisACharge,
  Itinerance,
  Itinerances,
  ModaliteAcces,
  ModaliteAccompagnement,
  ModalitesAcces,
  ModalitesAccompagnement,
  Nom,
  PriseEnChargeSpecifique,
  PrisesEnChargeSpecifiques,
  PublicSpecifiquementAdresse,
  PublicsSpecifiquementAdresses,
  Service,
  Services,
  Typologie,
  Typologies,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { VisibiliteCartographie } from '../../../domain/cartographie-nationale/visibilite-cartographie'
import type { Fiche } from '../../../domain/fiche'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { Lieu } from '../../../domain/lieu'
import { ModificationInconnue } from '../../../domain/registre/tracabilite'
import type { FicheFusionnable, HeritageDeLaFiche } from './fiche-fusionnable'
import { fusionnerDesLieux } from './fusionner-des-lieux'
import type { FusionDesLieux } from './ports'

const SOURCE = LieuId('550e8400-e29b-41d4-a716-446655440000')
const CIBLE = LieuId('7c9e6679-7425-40de-944b-e07fc1f90ae7')
const maintenant = new Date('2026-11-26T10:00:00Z')

const ficheVide: Fiche = {
  nom: Nom('Espace numérique'),
  pivot: null,
  adresse: null,
  localisation: null,
  typologies: Typologies([]),
  contact: Contact({}),
  horaires: null,
  presentation: null,
  services: Services([]),
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

const lieu = (id: LieuId, visibilite: VisibiliteCartographie): Lieu => ({
  id,
  fiche: ficheVide,
  visibilite,
  idsCartographieNationale: null,
  banId: null,
  identiteSirene: { nomUsage: null, synchronisation: null },
  tracabilite: {
    creation: { date: new Date('2026-01-01T00:00:00Z'), par: null },
    derniereModification: ModificationInconnue(
      new Date('2026-01-01T00:00:00Z'),
    ),
    suppression: { _tag: 'Actif' },
  },
})

const sansHeritage: HeritageDeLaFiche = {
  nomReferent: null,
  courrielReferent: null,
  telephoneReferent: null,
  v1Imported: null,
  v1StructureId: null,
  v1StructureIdPg: null,
  v1PermanenceId: null,
}

const heritageDeLaSource: HeritageDeLaFiche = {
  nomReferent: 'Absorbe',
  courrielReferent: 'absorbe@example.com',
  telephoneReferent: '0102030405',
  v1Imported: new Date('2023-01-01T00:00:00Z'),
  v1StructureId: 'structure-v1-source',
  v1StructureIdPg: 12,
  v1PermanenceId: 'permanence-v1-source',
}

const heritageDeLaCible: HeritageDeLaFiche = {
  nomReferent: 'Conserve',
  courrielReferent: 'conserve@example.com',
  telephoneReferent: '0607080910',
  v1Imported: new Date('2024-01-01T00:00:00Z'),
  v1StructureId: 'structure-v1-cible',
  v1StructureIdPg: 34,
  v1PermanenceId: 'permanence-v1-cible',
}

const publiee = (id: LieuId): FicheFusionnable => ({
  lieu: lieu(id, VisibiliteCartographie('Publie')),
  heritage: sansHeritage,
})

const retiree = (id: LieuId): FicheFusionnable => ({
  lieu: lieu(id, VisibiliteCartographie('NonPublie')),
  heritage: sansHeritage,
})

const sourceRenseignee: FicheFusionnable = {
  lieu: {
    ...lieu(SOURCE, VisibiliteCartographie('Publie')),
    fiche: {
      ...ficheVide,
      typologies: Typologies([Typologie.BIB, Typologie.ASSO]),
      services: Services([Service.AideAuxDemarchesAdministratives]),
      publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([
        PublicSpecifiquementAdresse.Jeunes,
      ]),
      priseEnChargeSpecifique: PrisesEnChargeSpecifiques([
        PriseEnChargeSpecifique.Surdite,
      ]),
      fraisACharge: FraisACharge([Frais.Gratuit]),
      dispositifProgrammesNationaux: DispositifProgrammesNationaux([
        DispositifProgrammeNational.FranceServices,
      ]),
      formationsLabels: FormationsLabels([
        FormationLabel.FabriquesDeTerritoire,
      ]),
      autresFormationsLabels: ['Label local'],
      itinerance: Itinerances([Itinerance.Fixe]),
      modalitesAcces: ModalitesAcces([ModaliteAcces.SePresenter]),
      modalitesAccompagnement: ModalitesAccompagnement([
        ModaliteAccompagnement.EnAutonomie,
      ]),
      contact: Contact({ courriels: [Courriel('source@example.fr')] }),
    },
  },
  heritage: heritageDeLaSource,
}

const cibleRenseignee: FicheFusionnable = {
  lieu: {
    ...lieu(CIBLE, VisibiliteCartographie('Publie')),
    fiche: {
      ...ficheVide,
      nom: Nom('Médiathèque'),
      typologies: Typologies([Typologie.BIB]),
      services: Services([Service.LoisirsEtCreationsNumeriques]),
      publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([
        PublicSpecifiquementAdresse.Seniors,
      ]),
      priseEnChargeSpecifique: PrisesEnChargeSpecifiques([
        PriseEnChargeSpecifique.Illettrisme,
      ]),
      fraisACharge: FraisACharge([Frais.Payant]),
      dispositifProgrammesNationaux: DispositifProgrammesNationaux([
        DispositifProgrammeNational.ConseillersNumeriques,
      ]),
      formationsLabels: FormationsLabels([FormationLabel.MesPapiers]),
      autresFormationsLabels: ['Label régional'],
      itinerance: Itinerances([Itinerance.Itinerant]),
      modalitesAcces: ModalitesAcces([ModaliteAcces.Telephoner]),
      modalitesAccompagnement: ModalitesAccompagnement([
        ModaliteAccompagnement.DansUnAtelier,
      ]),
      contact: Contact({ courriels: [Courriel('cible@example.fr')] }),
    },
  },
  heritage: heritageDeLaCible,
}

const fusionne = async (): Promise<FusionDesLieux> => ({ _tag: 'Fusionnes' })

const MEDIATEUR_DE_LA_SOURCE = MediateurId(
  '0927f824-b84d-4840-ae2e-e4a96a7a519b',
)
const MEDIATEUR_DES_DEUX = MediateurId('f98724ab-93d2-46cd-bff6-1821dd6a6da7')

const sansMediateur = async () => ({
  rattachesALaSource: [],
  enActiviteDansLaCible: [],
})

describe('fusionner des lieux', () => {
  it.each<{
    cas: string
    fiches: readonly FicheFusionnable[]
    manquant: LieuId
  }>([
    {
      cas: 'refuse la fusion quand le lieu à absorber est introuvable',
      fiches: [publiee(CIBLE)],
      manquant: SOURCE,
    },
    {
      cas: 'refuse la fusion quand le lieu à conserver est introuvable',
      fiches: [publiee(SOURCE)],
      manquant: CIBLE,
    },
  ])('$cas', async ({ fiches, manquant }) => {
    expect(
      await fusionnerDesLieux({
        fichesAFusionner: async () => fiches,
        mediateursDesLieux: sansMediateur,
        fusionner: fusionne,
      })({ source: SOURCE, cible: CIBLE, maintenant }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: manquant }))
  })

  it.each<{ cas: string; disparu: LieuId }>([
    {
      cas: 'signale le lieu à absorber qui disparaît avant la fusion',
      disparu: SOURCE,
    },
    {
      cas: 'signale le lieu à conserver qui disparaît avant la fusion',
      disparu: CIBLE,
    },
  ])('$cas', async ({ disparu }) => {
    expect(
      await fusionnerDesLieux({
        fichesAFusionner: async () => [publiee(SOURCE), publiee(CIBLE)],
        mediateursDesLieux: sansMediateur,
        fusionner: async () => ({ _tag: 'LieuDisparu', lieuId: disparu }),
      })({ source: SOURCE, cible: CIBLE, maintenant }),
    ).toEqual(failure({ _tag: 'LieuIntrouvable', lieuId: disparu }))
  })

  it('ne transfère au lieu conservé que les médiateurs qui n’y exercent pas déjà, une seule fois chacun', async () => {
    expect(
      await fusionnerDesLieux({
        fichesAFusionner: async () => [publiee(SOURCE), publiee(CIBLE)],
        mediateursDesLieux: async () => ({
          rattachesALaSource: [
            MEDIATEUR_DE_LA_SOURCE,
            MEDIATEUR_DES_DEUX,
            MEDIATEUR_DE_LA_SOURCE,
          ],
          enActiviteDansLaCible: [MEDIATEUR_DES_DEUX],
        }),
        fusionner: fusionne,
      })({ source: SOURCE, cible: CIBLE, maintenant }),
    ).toEqual(
      success({
        source: SOURCE,
        cible: CIBLE,
        fusionneLe: maintenant,
        fiche: publiee(CIBLE),
        mediateursATransferer: [MEDIATEUR_DE_LA_SOURCE],
        ecritureAuRegistre: 'FicheComplete',
      }),
    )
  })

  it.each<{
    cas: string
    source: FicheFusionnable
    cible: FicheFusionnable
    fiche: FicheFusionnable
  }>([
    {
      cas: 'publie le lieu conservé quand les deux l’étaient',
      source: publiee(SOURCE),
      cible: publiee(CIBLE),
      fiche: publiee(CIBLE),
    },
    {
      cas: 'retire de la carte le lieu conservé quand le lieu absorbé ne l’était pas',
      source: retiree(SOURCE),
      cible: publiee(CIBLE),
      fiche: retiree(CIBLE),
    },
    {
      cas: 'laisse hors de la carte le lieu conservé qui n’y était pas',
      source: publiee(SOURCE),
      cible: retiree(CIBLE),
      fiche: retiree(CIBLE),
    },
    {
      cas: 'cumule ce que déclarent les deux fiches et garde ce que le lieu conservé renseigne',
      source: sourceRenseignee,
      cible: cibleRenseignee,
      fiche: {
        lieu: {
          ...cibleRenseignee.lieu,
          fiche: {
            ...cibleRenseignee.lieu.fiche,
            typologies: Typologies([Typologie.BIB, Typologie.ASSO]),
            services: Services([
              Service.LoisirsEtCreationsNumeriques,
              Service.AideAuxDemarchesAdministratives,
            ]),
            publicsSpecifiquementAdresses: PublicsSpecifiquementAdresses([
              PublicSpecifiquementAdresse.Seniors,
              PublicSpecifiquementAdresse.Jeunes,
            ]),
            priseEnChargeSpecifique: PrisesEnChargeSpecifiques([
              PriseEnChargeSpecifique.Illettrisme,
              PriseEnChargeSpecifique.Surdite,
            ]),
            fraisACharge: FraisACharge([Frais.Payant, Frais.Gratuit]),
            dispositifProgrammesNationaux: DispositifProgrammesNationaux([
              DispositifProgrammeNational.ConseillersNumeriques,
              DispositifProgrammeNational.FranceServices,
            ]),
            formationsLabels: FormationsLabels([
              FormationLabel.MesPapiers,
              FormationLabel.FabriquesDeTerritoire,
            ]),
            autresFormationsLabels: ['Label régional', 'Label local'],
            itinerance: Itinerances([Itinerance.Itinerant, Itinerance.Fixe]),
            modalitesAcces: ModalitesAcces([
              ModaliteAcces.Telephoner,
              ModaliteAcces.SePresenter,
            ]),
            modalitesAccompagnement: ModalitesAccompagnement([
              ModaliteAccompagnement.DansUnAtelier,
              ModaliteAccompagnement.EnAutonomie,
            ]),
            contact: Contact({
              courriels: [
                Courriel('cible@example.fr'),
                Courriel('source@example.fr'),
              ],
            }),
          },
        },
        heritage: heritageDeLaCible,
      },
    },
    {
      cas: 'reprend ce que seule la fiche absorbée renseigne',
      source: { ...publiee(SOURCE), heritage: heritageDeLaSource },
      cible: publiee(CIBLE),
      fiche: { ...publiee(CIBLE), heritage: heritageDeLaSource },
    },
  ])('$cas', async ({ source, cible, fiche }) => {
    expect(
      await fusionnerDesLieux({
        fichesAFusionner: async () => [source, cible],
        mediateursDesLieux: sansMediateur,
        fusionner: fusionne,
      })({ source: SOURCE, cible: CIBLE, maintenant }),
    ).toEqual(
      success({
        source: SOURCE,
        cible: CIBLE,
        fusionneLe: maintenant,
        fiche,
        mediateursATransferer: [],
        ecritureAuRegistre: 'FicheComplete',
      }),
    )
  })
})
