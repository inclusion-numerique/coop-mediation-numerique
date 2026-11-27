import { failure, type Result, success } from '@/libraries/result'
import {
  ActionNonAutorisee,
  type CoordinateurId,
  type CriteresDesActivites,
  type MediateurId,
} from '../../../domain'
import type { ExportDesAccompagnements } from './activite-exportee'
import type { EchecDExporterMesAccompagnements } from './errors'
import type {
  MediateurNomme,
  NomsDesFiltresExportes,
} from './noms-des-filtres-exportes'
import {
  type Demandeur,
  estUnExportPersonnel,
  mediateursAutorises,
  perimetreDeLExport,
} from './perimetre-de-l-export'
import type { ExporterMesAccompagnementsPorts, MediateurLu } from './ports'

type PortsDesNoms = Omit<
  ExporterMesAccompagnementsPorts,
  'accompagnementsExportes' | 'importsV1Presents'
>

export type ExportNomme = {
  readonly exportDes: ExportDesAccompagnements
  readonly noms: NomsDesFiltresExportes
}

const siFiltre = <T>(
  valeurs: readonly unknown[],
  lire: () => Promise<readonly T[]>,
): Promise<readonly T[]> =>
  valeurs.length === 0 ? Promise.resolve([]) : lire()

const estUnAncienMembre = ({ appartenances }: MediateurLu): boolean =>
  appartenances.length > 0 &&
  appartenances.every(({ suppression }) => suppression !== null)

const mediateursNommes = (
  lus: readonly MediateurLu[],
  coordinateurId: CoordinateurId | null,
): readonly MediateurNomme[] => {
  const nommes = lus.map((lu) => ({
    mediateurId: lu.mediateurId,
    nom: lu.nom,
    ancien: coordinateurId !== null && estUnAncienMembre(lu),
  }))
  return [
    ...nommes.filter(({ ancien }) => !ancien),
    ...nommes.filter(({ ancien }) => ancien),
  ]
}

const nommerLesFiltres = async (
  {
    mediateursLus,
    employeusesNommees,
    lieuxNommes,
    communesEtDepartements,
    tagsUtilisables,
    beneficiairesNommes,
  }: PortsDesNoms,
  demandeur: Demandeur,
  autorises: readonly MediateurId[],
  criteres: CriteresDesActivites,
): Promise<NomsDesFiltresExportes> => {
  const { mediateurId, coordinateurId } = demandeur
  const territoire = [...criteres.communes, ...criteres.departements]

  const [
    beneficiaires,
    mediateurs,
    employeuses,
    lieux,
    { communes, departements },
    tags,
  ] = await Promise.all([
    mediateurId === null
      ? Promise.resolve([])
      : siFiltre(criteres.beneficiaires, () =>
          beneficiairesNommes({ mediateurId, ids: criteres.beneficiaires }),
        ),
    siFiltre(criteres.mediateurs, async () =>
      mediateursNommes(
        await mediateursLus({
          ids: perimetreDeLExport(autorises, criteres.mediateurs),
          coordinateurId,
        }),
        coordinateurId,
      ),
    ),
    autorises.length === 0
      ? Promise.resolve([])
      : siFiltre(criteres.employeuses, () =>
          employeusesNommees({
            perimetre: { mediateurs: autorises, coordinateurId },
            ids: criteres.employeuses,
          }),
        ),
    siFiltre(criteres.lieux, () =>
      lieuxNommes({ mediateurs: autorises, mediateurId, coordinateurId }),
    ),
    territoire.length === 0
      ? Promise.resolve({ communes: [], departements: [] })
      : communesEtDepartements({ mediateurIds: autorises }),
    siFiltre(criteres.tags, () => tagsUtilisables(criteres.tags)),
  ])

  return {
    beneficiaires,
    mediateurs,
    employeuses,
    communes,
    departements,
    lieux,
    tags,
  }
}

export const exporterMesAccompagnements =
  ({
    accompagnementsExportes,
    importsV1Presents,
    ...portsDesNoms
  }: ExporterMesAccompagnementsPorts) =>
  async ({
    demandeur,
    criteres,
  }: {
    readonly demandeur: Demandeur
    readonly criteres: CriteresDesActivites
  }): Promise<Result<ExportNomme, EchecDExporterMesAccompagnements>> => {
    if (demandeur.mediateurId === null && demandeur.coordinateurId === null)
      return failure(ActionNonAutorisee())

    const autorises = mediateursAutorises(demandeur)
    const [activites, avecImportsV1, noms] = await Promise.all([
      accompagnementsExportes({
        perimetre: perimetreDeLExport(autorises, criteres.mediateurs),
        coordinateurId: demandeur.coordinateurId,
        criteres,
      }),
      demandeur.coordinateurId === null
        ? importsV1Presents(autorises)
        : Promise.resolve(true),
      nommerLesFiltres(portsDesNoms, demandeur, autorises, criteres),
    ])

    return success({
      exportDes: {
        activites,
        colonnes: {
          personnel: estUnExportPersonnel(demandeur, autorises),
          source: avecImportsV1,
        },
      },
      noms,
    })
  }
