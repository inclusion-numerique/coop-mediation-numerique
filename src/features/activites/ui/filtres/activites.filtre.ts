import { z } from 'zod'
import {
  filtreDeChoix,
  filtreDeChoixUnique,
} from '@/libraries/filtres/definition/filtre-de-choix'
import { filtreDeRecherche } from '@/libraries/filtres/definition/filtre-de-recherche'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  type CriteresDesActivites,
  type CriteresDesStatistiques,
  EmployeuseId,
  FiltreDeDispositif,
  Jour,
  LieuActiviteId,
  MediateurId,
  SOURCES_DE_L_ACTIVITE,
  SourceDeLActivite,
  STATUTS_DE_RENDEZ_VOUS,
  StatutDeRendezVous,
  TagId,
  ThematiqueRecherchee,
  TYPES_D_ACTIVITE,
  TypeDActivite,
} from '../../domain'
import {
  thematiquesAdministrativesLabels,
  thematiquesNonAdministrativesLabels,
} from '../labels/libelles/thematique.labels'
import { typeActiviteLabels } from '../labels/libelles/type-activite.labels'

const { AideAuxDemarchesAdministratives: _, ...thematiquesDeMediation } =
  thematiquesNonAdministrativesLabels

export const filtreDuTypeDActivite = filtreDeChoix({
  titre: 'Type d’accompagnement',
  cle: 'types',
  choix: typeActiviteLabels,
  dansLURL: { Individuel: 'individuel', Collectif: 'collectif' },
})

export const filtreDuStatutDeRendezVous = filtreDeChoix({
  titre: 'Statut du rendez-vous',
  cle: 'rdvs',
  choix: {
    AVenir: 'À venir',
    Passe: 'Passé',
    Honore: 'Honoré',
    Annule: 'Annulé',
    AnnuleParLeBeneficiaire: 'Annulé par bénéficiaire',
    Absent: 'Absence',
  },
  dansLURL: {
    AVenir: 'unknown',
    Passe: 'past',
    Honore: 'seen',
    Annule: 'revoked',
    AnnuleParLeBeneficiaire: 'excused',
    Absent: 'noshow',
  },
})

export const filtreDesThematiquesDeMediation = filtreDeChoix({
  titre: 'Thématiques non administratives',
  cle: 'thematiqueNonAdministratives',
  choix: thematiquesDeMediation,
})

export const filtreDesThematiquesAdministratives = filtreDeChoix({
  titre: 'Thématiques administratives',
  cle: 'thematiqueAdministratives',
  choix: thematiquesAdministrativesLabels,
})

export const filtreDeLaSource = filtreDeChoixUnique({
  titre: 'Source',
  cle: 'source',
  choix: {
    ImportV1: 'Espace Coop (V1)',
    Coop: 'La Coop de la médiation numérique',
  },
  dansLURL: { ImportV1: 'v1', Coop: 'v2' },
})

export const filtreDesLieux = filtreDeRecherche({
  titre: 'Lieux d’accompagnement',
  cle: 'lieux',
  schema: LieuActiviteId.schema,
})

export const filtreDesCommunes = filtreDeRecherche({
  titre: 'Communes',
  cle: 'communes',
  schema: CodeInsee.schema,
})

export const filtreDesDepartements = filtreDeRecherche({
  titre: 'Départements',
  cle: 'departements',
  schema: CodeDepartement.schema,
})

export const filtreDesTags = filtreDeRecherche({
  titre: 'Tags',
  cle: 'tags',
  schema: TagId.schema,
})

export const filtreDesEmployeuses = filtreDeRecherche({
  titre: 'Structures employeuses',
  cle: 'structuresEmployeuses',
  schema: z.coerce.number().pipe(EmployeuseId.schema),
})

export const filtreDesMediateurs = filtreDeRecherche({
  titre: 'Médiateurs',
  cle: 'mediateurs',
  schema: MediateurId.schema,
})

export const filtreDuDispositif = filtreDeChoixUnique({
  titre: 'Rôle',
  cle: 'conseiller_numerique',
  choix: {
    ConseillersNumeriques: 'Conseillers numériques',
    HorsDispositif: 'Médiateurs numériques',
  },
  dansLURL: { ConseillersNumeriques: '1', HorsDispositif: '0' },
})

type ValeursDesFiltres = {
  readonly du: Date | null
  readonly au: Date | null
  readonly types?: readonly (typeof TYPES_D_ACTIVITE)[number][]
  readonly rdvs?: readonly (typeof STATUTS_DE_RENDEZ_VOUS)[number][]
  readonly thematiqueNonAdministratives?: readonly (keyof typeof thematiquesDeMediation)[]
  readonly thematiqueAdministratives?: readonly (keyof typeof thematiquesAdministrativesLabels)[]
  readonly source?: (typeof SOURCES_DE_L_ACTIVITE)[number] | null
  readonly lieux?: readonly LieuActiviteId[]
  readonly communes?: readonly CodeInsee[]
  readonly departements?: readonly CodeDepartement[]
  readonly tags?: readonly TagId[]
  readonly structuresEmployeuses?: readonly EmployeuseId[]
  readonly mediateurs?: readonly MediateurId[]
  readonly conseiller_numerique?:
    | 'ConseillersNumeriques'
    | 'HorsDispositif'
    | null
}

export const criteresDesFiltres = (
  valeurs: ValeursDesFiltres,
): CriteresDesActivites => ({
  periode:
    valeurs.du === null || valeurs.au === null
      ? null
      : { du: valeurs.du, au: valeurs.au },
  types: (valeurs.types ?? []).map((type) => TypeDActivite(type)),
  statutsDeRendezVous: (valeurs.rdvs ?? []).map((statut) =>
    StatutDeRendezVous(statut),
  ),
  mediateurs: valeurs.mediateurs ?? [],
  beneficiaires: [],
  communes: valeurs.communes ?? [],
  departements: valeurs.departements ?? [],
  lieux: valeurs.lieux ?? [],
  thematiques: [
    ...(valeurs.thematiqueNonAdministratives ?? []),
    ...(valeurs.thematiqueAdministratives ?? []),
  ].map((thematique) => ThematiqueRecherchee(thematique)),
  demarche: null,
  tags: valeurs.tags ?? [],
  employeuses: valeurs.structuresEmployeuses ?? [],
  dispositif:
    valeurs.conseiller_numerique === undefined ||
    valeurs.conseiller_numerique === null
      ? null
      : FiltreDeDispositif(valeurs.conseiller_numerique),
  origine: null,
  source:
    valeurs.source === undefined || valeurs.source === null
      ? null
      : SourceDeLActivite(valeurs.source),
})

const jourDe = (date: Date | null): Jour | null =>
  date === null ? null : Jour(date.toISOString().slice(0, 10))

export const criteresDesStatistiquesDesFiltres = (
  valeurs: ValeursDesFiltres,
): CriteresDesStatistiques => ({
  ...criteresDesFiltres(valeurs),
  periode: { du: jourDe(valeurs.du), au: jourDe(valeurs.au) },
})
