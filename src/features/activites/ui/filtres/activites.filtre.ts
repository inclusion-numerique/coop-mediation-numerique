import { z } from 'zod'
import {
  filtreDeChoix,
  filtreDeChoixUnique,
} from '@/libraries/filtres/definition/filtre-de-choix'
import { filtreDeRecherche } from '@/libraries/filtres/definition/filtre-de-recherche'
import { CodeDepartement, CodeInsee } from '@/libraries/insee'
import {
  type CriteresDesActivites,
  EmployeuseId,
  LieuActiviteId,
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
  cle: 'types',
  choix: typeActiviteLabels,
  dansLURL: { Individuel: 'individuel', Collectif: 'collectif' },
})

export const filtreDuStatutDeRendezVous = filtreDeChoix({
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
  cle: 'thematiqueNonAdministratives',
  choix: thematiquesDeMediation,
})

export const filtreDesThematiquesAdministratives = filtreDeChoix({
  cle: 'thematiqueAdministratives',
  choix: thematiquesAdministrativesLabels,
})

export const filtreDeLaSource = filtreDeChoixUnique({
  cle: 'source',
  choix: {
    ImportV1: 'Espace Coop (V1)',
    Coop: 'La Coop de la médiation numérique',
  },
  dansLURL: { ImportV1: 'v1', Coop: 'v2' },
})

export const filtreDesLieux = filtreDeRecherche({
  cle: 'lieux',
  schema: LieuActiviteId.schema,
})

export const filtreDesCommunes = filtreDeRecherche({
  cle: 'communes',
  schema: CodeInsee.schema,
})

export const filtreDesDepartements = filtreDeRecherche({
  cle: 'departements',
  schema: CodeDepartement.schema,
})

export const filtreDesTags = filtreDeRecherche({
  cle: 'tags',
  schema: TagId.schema,
})

export const filtreDesEmployeuses = filtreDeRecherche({
  cle: 'structuresEmployeuses',
  schema: z.coerce.number().pipe(EmployeuseId.schema),
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
  mediateurs: [],
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
  dispositif: null,
  origine: null,
  source:
    valeurs.source === undefined || valeurs.source === null
      ? null
      : SourceDeLActivite(valeurs.source),
})
