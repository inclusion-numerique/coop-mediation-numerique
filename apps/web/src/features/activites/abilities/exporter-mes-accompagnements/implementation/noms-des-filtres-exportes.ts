import type { Prisma } from '@app/web/generated/prisma/client'
import { dansLaPeriodeDAppartenance } from '../../../db/periode-d-appartenance.sql'
import type {
  BeneficiaireId,
  CriteresDesActivites,
  TagsUtilisables,
} from '../../../domain'
import {
  type Demandeur,
  mediateursAutorises,
  type NomDeFiltre,
  type NomDeFiltreDeBeneficiaire,
  type NomDeFiltreDeMediateur,
  type NomsDesFiltresExportes,
} from '../domain'
import { employeusesNommees } from './prisma/employeuses-nommees.query'

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
  mediateurs,
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
  readonly mediateurs: () => Promise<readonly NomDeFiltreDeMediateur[]>
}): Promise<NomsDesFiltresExportes> => {
  const autorises = mediateursAutorises(demandeur)
  const territoire = [...criteres.communes, ...criteres.departements]

  const [
    beneficiairesNommes,
    mediateursNommes,
    employeuses,
    lieux,
    { communesOptions, departementsOptions },
    tags,
  ] = await Promise.all([
    siFiltre(criteres.beneficiaires, () =>
      beneficiaires(criteres.beneficiaires),
    ),
    siFiltre(criteres.mediateurs, mediateurs),
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
    mediateurs: mediateursNommes,
    employeuses,
    communes: communesOptions,
    departements: departementsOptions,
    lieux,
    tags,
  }
}
