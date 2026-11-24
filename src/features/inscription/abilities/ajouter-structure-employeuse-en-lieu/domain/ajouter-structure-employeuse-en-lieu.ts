import type { UtilisateurId } from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import { EmployeuseId } from './employeuse-id'
import {
  AdresseNonReconnue,
  type AjouterStructureEmployeuseEnLieuError,
  EmployeuseIntrouvable,
  ServiceAdresseIndisponible,
} from './errors'
import { lieuDepuisEmployeuse } from './lieu-depuis-employeuse'
import type {
  ConsulterEmployeuseActuelle,
  DetacherDuLieuDecrit,
  Geocodage,
  GeocoderLAdresse,
  LireLAdresseDeLEmployeuse,
  RattacherAuLieuDecrit,
} from './ports'

export type AjouterStructureEmployeuseEnLieuPorts = {
  readonly lireLAdresseDeLEmployeuse: LireLAdresseDeLEmployeuse
  readonly geocoderLAdresse: GeocoderLAdresse
  readonly consulterEmployeuseActuelle: ConsulterEmployeuseActuelle
  readonly rattacherAuLieuDecrit: RattacherAuLieuDecrit
  readonly detacherDuLieuDecrit: DetacherDuLieuDecrit
}

const adresseDuLieuAMaterialiser = async (
  structureEmployeuseId: EmployeuseId,
  {
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse,
  }: AjouterStructureEmployeuseEnLieuPorts,
): Promise<Geocodage> => {
  const adresse = await lireLAdresseDeLEmployeuse(structureEmployeuseId)

  return adresse == null
    ? { _tag: 'AdresseInconnue' }
    : geocoderLAdresse(adresse)
}

export const ajouterStructureEmployeuseEnLieu =
  (ports: AjouterStructureEmployeuseEnLieuPorts) =>
  async ({
    userId,
    estLieuActivite,
  }: {
    readonly userId: UtilisateurId
    readonly estLieuActivite: boolean
  }): Promise<Result<void, AjouterStructureEmployeuseEnLieuError>> => {
    const actuelle = await ports.consulterEmployeuseActuelle({ userId })

    if (actuelle === null) return failure(EmployeuseIntrouvable(userId))

    const { employeuse } = actuelle
    const structureEmployeuseId = EmployeuseId(employeuse.id)
    const trace = { userId, structureId: employeuse.id }

    if (!estLieuActivite) {
      await ports.detacherDuLieuDecrit({
        userId,
        lieu: lieuDepuisEmployeuse(employeuse),
        trace,
      })
      return success<void>(undefined)
    }

    const geocodage = await adresseDuLieuAMaterialiser(
      structureEmployeuseId,
      ports,
    )

    if (geocodage._tag === 'ServiceIndisponible')
      return failure(ServiceAdresseIndisponible(structureEmployeuseId))

    if (geocodage._tag === 'AdresseInconnue')
      return failure(AdresseNonReconnue(structureEmployeuseId))

    await ports.rattacherAuLieuDecrit({
      userId,
      lieu: lieuDepuisEmployeuse(employeuse, geocodage.adresse),
      trace,
    })

    return success<void>(undefined)
  }
