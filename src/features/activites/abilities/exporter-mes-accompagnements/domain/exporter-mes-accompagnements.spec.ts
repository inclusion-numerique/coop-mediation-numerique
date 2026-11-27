import { describe, expect, it } from 'vitest'
import { CodeInsee } from '@/libraries/insee'
import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  BeneficiaireId,
  CoordinateurId,
  CRITERES_VIDES,
  type CriteresDesActivites,
  EmployeuseId,
  LieuActiviteId,
  MediateurId,
  NomDeStructure,
  NomDeTag,
  TagId,
} from '../../../domain'
import type { ActiviteExportee } from './activite-exportee'
import type { EchecDExporterMesAccompagnements } from './errors'
import {
  type ExportNomme,
  exporterMesAccompagnements,
} from './exporter-mes-accompagnements'
import type { NomsDesFiltresExportes } from './noms-des-filtres-exportes'
import type { Demandeur } from './perimetre-de-l-export'
import type { ExporterMesAccompagnementsPorts, MediateurLu } from './ports'

const moi = MediateurId('6c1f4a3e-2f7b-4c55-9a0e-1d2b3c4d5e6f')
const membre = MediateurId('7d2a5b4f-3a8c-4d66-8b1f-2e3c4d5e6f70')
const ancien = MediateurId('8e3b6c5a-4b9d-4e77-9c2a-3f4d5e6f7081')
const coordinateur = CoordinateurId('a05d8e7c-6dbf-4a99-9e4c-516f70819203')
const beneficiaire = BeneficiaireId('b0000000-0000-4000-8000-000000000001')
const employeuse = EmployeuseId(42)
const tag = TagId('c0000000-0000-4000-8000-000000000001')

const mediateurSeul: Demandeur = {
  mediateurId: moi,
  coordinateurId: null,
  equipe: [],
}

const coordinateurSeul: Demandeur = {
  mediateurId: null,
  coordinateurId: coordinateur,
  equipe: [membre, ancien],
}

const coordinateurSansEquipe: Demandeur = {
  mediateurId: null,
  coordinateurId: coordinateur,
  equipe: [],
}

const activites: readonly ActiviteExportee[] = []

const lus: readonly MediateurLu[] = [
  {
    mediateurId: ancien,
    nom: 'Ada Lovelace',
    appartenances: [{ suppression: new Date('2026-03-06T00:00:00.000Z') }],
  },
  {
    mediateurId: membre,
    nom: 'Grace Hopper',
    appartenances: [{ suppression: null }],
  },
  { mediateurId: moi, nom: 'Margaret Hamilton', appartenances: [] },
]

const sansNom: NomsDesFiltresExportes = {
  beneficiaires: [],
  mediateurs: [],
  employeuses: [],
  communes: [],
  departements: [],
  lieux: [],
  tags: [],
}

const nomsFournis = {
  beneficiaires: [{ label: 'Paul Durand', value: { id: beneficiaire } }],
  employeuses: [
    { id: employeuse, nom: NomDeStructure('Mairie de Lyon'), commune: null },
  ],
  communes: [{ label: 'Lyon', value: '69123' }],
  departements: [{ label: 'Rhône', value: '69' }],
  lieux: [{ label: 'Médiathèque', value: 'lieu' }],
  tags: [{ id: tag, nom: NomDeTag('Numérique en famille') }],
}

const ports: ExporterMesAccompagnementsPorts = {
  accompagnementsExportes: async () => activites,
  importsV1Presents: async () => false,
  mediateursLus: async () => lus,
  employeusesNommees: async () => nomsFournis.employeuses,
  lieuxNommes: async () => nomsFournis.lieux,
  communesEtDepartements: async () => ({
    communesOptions: nomsFournis.communes,
    departementsOptions: nomsFournis.departements,
  }),
  tagsUtilisables: async () => nomsFournis.tags,
  beneficiairesNommes: async () => nomsFournis.beneficiaires,
}

const tousLesFiltres: CriteresDesActivites = {
  ...CRITERES_VIDES,
  beneficiaires: [beneficiaire],
  employeuses: [employeuse],
  communes: [CodeInsee('69123')],
  lieux: [LieuActiviteId('d0000000-0000-4000-8000-000000000001')],
  tags: [tag],
}

const exportDe = (
  noms: NomsDesFiltresExportes,
  colonnes: { readonly personnel: boolean; readonly source: boolean },
): Result<ExportNomme, EchecDExporterMesAccompagnements> =>
  success({ exportDes: { activites, colonnes }, noms })

describe('exporter mes accompagnements', () => {
  it('refuse un demandeur qui n’est ni médiateur ni coordinateur', async () => {
    expect(
      await exporterMesAccompagnements(ports)({
        demandeur: { mediateurId: null, coordinateurId: null, equipe: [] },
        criteres: CRITERES_VIDES,
      }),
    ).toEqual(failure(ActionNonAutorisee()))
  })

  it.each<{
    cas: string
    demandeur: Demandeur
    importsV1Presents: () => Promise<boolean>
    attendu: Result<ExportNomme, EchecDExporterMesAccompagnements>
  }>([
    {
      cas: 'exporte, sans filtre, les seules activités d’un médiateur, sans colonne de source s’il n’a rien importé',
      demandeur: mediateurSeul,
      importsV1Presents: async () => false,
      attendu: exportDe(sansNom, { personnel: true, source: false }),
    },
    {
      cas: 'affiche la source pour un médiateur qui a importé des activités de la v1',
      demandeur: mediateurSeul,
      importsV1Presents: async () => true,
      attendu: exportDe(sansNom, { personnel: true, source: true }),
    },
    {
      cas: 'affiche toujours la source pour un coordinateur, dont l’export n’est pas personnel',
      demandeur: coordinateurSeul,
      importsV1Presents: async () => false,
      attendu: exportDe(sansNom, { personnel: false, source: true }),
    },
  ])('$cas', async ({ demandeur, importsV1Presents, attendu }) => {
    expect(
      await exporterMesAccompagnements({ ...ports, importsV1Presents })({
        demandeur,
        criteres: CRITERES_VIDES,
      }),
    ).toEqual(attendu)
  })

  it.each<{
    cas: string
    demandeur: Demandeur
    attendu: Result<ExportNomme, EchecDExporterMesAccompagnements>
  }>([
    {
      cas: 'nomme chaque filtre actif d’un médiateur',
      demandeur: mediateurSeul,
      attendu: exportDe(
        { ...nomsFournis, mediateurs: [] },
        { personnel: true, source: false },
      ),
    },
    {
      cas: 'ne nomme aucun bénéficiaire pour un coordinateur qui n’est pas médiateur',
      demandeur: coordinateurSeul,
      attendu: exportDe(
        { ...nomsFournis, beneficiaires: [], mediateurs: [] },
        { personnel: false, source: true },
      ),
    },
    {
      cas: 'ne nomme aucune employeuse pour un coordinateur sans équipe',
      demandeur: coordinateurSansEquipe,
      attendu: exportDe(
        { ...nomsFournis, beneficiaires: [], employeuses: [], mediateurs: [] },
        { personnel: false, source: true },
      ),
    },
  ])('$cas', async ({ demandeur, attendu }) => {
    expect(
      await exporterMesAccompagnements(ports)({
        demandeur,
        criteres: tousLesFiltres,
      }),
    ).toEqual(attendu)
  })

  it.each<{
    cas: string
    demandeur: Demandeur
    attendu: Result<ExportNomme, EchecDExporterMesAccompagnements>
  }>([
    {
      cas: 'nomme les médiateurs filtrés d’un médiateur sans parler d’ancien membre',
      demandeur: mediateurSeul,
      attendu: exportDe(
        {
          ...sansNom,
          mediateurs: [
            { mediateurId: ancien, nom: 'Ada Lovelace', ancien: false },
            { mediateurId: membre, nom: 'Grace Hopper', ancien: false },
            { mediateurId: moi, nom: 'Margaret Hamilton', ancien: false },
          ],
        },
        { personnel: true, source: false },
      ),
    },
    {
      cas: 'range en dernier, et marque comme tels, les anciens membres de l’équipe d’un coordinateur',
      demandeur: coordinateurSeul,
      attendu: exportDe(
        {
          ...sansNom,
          mediateurs: [
            { mediateurId: membre, nom: 'Grace Hopper', ancien: false },
            { mediateurId: moi, nom: 'Margaret Hamilton', ancien: false },
            { mediateurId: ancien, nom: 'Ada Lovelace', ancien: true },
          ],
        },
        { personnel: false, source: true },
      ),
    },
  ])('$cas', async ({ demandeur, attendu }) => {
    expect(
      await exporterMesAccompagnements(ports)({
        demandeur,
        criteres: { ...CRITERES_VIDES, mediateurs: [moi, membre, ancien] },
      }),
    ).toEqual(attendu)
  })
})
