import type { Prisma } from '@app/web/generated/prisma/client'
import { dansLaPeriodeDAppartenance } from '../../../db/periode-d-appartenance.sql'
import type {
  BeneficiaireId,
  CriteresDesActivites,
  EmployeuseDesActivites,
  TagDeLActivite,
  TagsUtilisables,
} from '../../../domain'
import {
  type Demandeur,
  mediateursAutorises,
  perimetreDeLExport,
} from '../domain'
import { employeusesNommees } from './prisma/employeuses-nommees.query'
import {
  type MediateurNomme,
  mediateursNommes,
} from './prisma/mediateurs-nommes.query'

export type NomDeFiltre = { readonly label: string; readonly value: string }

export type NomDeFiltreDeBeneficiaire = {
  readonly label: string
  readonly value: { readonly id?: string | null } | null
}

export type NomsDesFiltresExportes = {
  readonly beneficiaires: readonly NomDeFiltreDeBeneficiaire[]
  readonly mediateurs: readonly MediateurNomme[]
  readonly employeuses: readonly EmployeuseDesActivites[]
  readonly communes: readonly NomDeFiltre[]
  readonly departements: readonly NomDeFiltre[]
  readonly lieux: readonly NomDeFiltre[]
  readonly tags: readonly TagDeLActivite[]
}

const siFiltre = <T>(
  valeurs: readonly unknown[],
  lire: () => Promise<readonly T[]>,
): Promise<readonly T[]> =>
  valeurs.length === 0 ? Promise.resolve([]) : lire()

export const nomsDesFiltresExportes = async ({
  demandeur,
  criteres,
  lieuxDesActivites,
  communesEtDepartements,
  tagsUtilisables,
  beneficiaires,
}: {
  readonly demandeur: Demandeur
  readonly criteres: CriteresDesActivites
  readonly lieuxDesActivites: (perimetre: {
    mediateurIds: string[]
    mediateurId?: string
    perimetreDesActivites: Prisma.Sql
  }) => Promise<readonly NomDeFiltre[]>
  readonly communesEtDepartements: (perimetre: {
    mediateurIds: string[]
  }) => Promise<{
    communesOptions: readonly NomDeFiltre[]
    departementsOptions: readonly NomDeFiltre[]
  }>
  readonly tagsUtilisables: TagsUtilisables
  readonly beneficiaires: (
    ids: readonly BeneficiaireId[],
  ) => Promise<readonly NomDeFiltreDeBeneficiaire[]>
}): Promise<NomsDesFiltresExportes> => {
  const autorises = mediateursAutorises(demandeur)
  const territoire = [...criteres.communes, ...criteres.departements]

  const [
    beneficiairesNommes,
    mediateurs,
    employeuses,
    lieux,
    { communesOptions, departementsOptions },
    tags,
  ] = await Promise.all([
    siFiltre(criteres.beneficiaires, () =>
      beneficiaires(criteres.beneficiaires),
    ),
    siFiltre(criteres.mediateurs, () =>
      mediateursNommes({
        ids: perimetreDeLExport(autorises, criteres.mediateurs),
        coordinateurId: demandeur.coordinateurId,
      }),
    ),
    employeusesNommees({
      perimetre: {
        mediateurs: autorises,
        coordinateurId: demandeur.coordinateurId,
      },
      ids: criteres.employeuses,
    }),
    siFiltre(criteres.lieux, () =>
      lieuxDesActivites({
        mediateurIds: [...autorises],
        mediateurId: demandeur.mediateurId ?? undefined,
        perimetreDesActivites: dansLaPeriodeDAppartenance(
          demandeur.coordinateurId,
        ),
      }),
    ),
    territoire.length === 0
      ? Promise.resolve({ communesOptions: [], departementsOptions: [] })
      : communesEtDepartements({ mediateurIds: [...autorises] }),
    siFiltre(criteres.tags, () => tagsUtilisables(criteres.tags)),
  ])

  return {
    beneficiaires: beneficiairesNommes,
    mediateurs,
    employeuses,
    communes: communesOptions,
    departements: departementsOptions,
    lieux,
    tags,
  }
}
