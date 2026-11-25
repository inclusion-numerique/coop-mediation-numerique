import type { Prisma } from '@/generated/prisma/client'
import type {
  BeneficiaireId,
  CriteresDesActivites,
  TagsUtilisables,
} from '../../../../domain'
import { dansLaPeriodeDAppartenance } from '../../../../implementations/prisma/statistiques/periode-d-appartenance.sql'
import {
  type Demandeur,
  mediateursAutorises,
  type NomDeFiltre,
  type NomDeFiltreDeBeneficiaire,
  type NomsDesFiltresExportes,
  perimetreDeLExport,
} from '../../domain'
import { employeusesNommees } from './employeuses-nommees.query'
import { mediateursNommes } from './mediateurs-nommes.query'

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
        ...(demandeur.mediateurId == null
          ? {}
          : { mediateurId: demandeur.mediateurId }),
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
