import type { UtilisateurId } from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EmployeuseEnLieu } from './employeuse-en-lieu'
import { EmployeuseId } from './employeuse-id'
import {
  AdresseNonReconnue,
  type EchecDAjouterStructureEmployeuseEnLieu,
  EmployeuseIntrouvable,
  ServiceAdresseIndisponible,
} from './errors'
import { lieuDepuisEmployeuse } from './lieu-depuis-employeuse'
import type { AjouterStructureEmployeuseEnLieuPorts, Geocodage } from './ports'

export const ajouterStructureEmployeuseEnLieu =
  ({
    consulterEmployeuseActuelle,
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse,
    rattacherAuLieuDecrit,
    detacherDuLieuDecrit,
  }: AjouterStructureEmployeuseEnLieuPorts) =>
  async ({
    userId,
    estLieuActivite,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly estLieuActivite: boolean
    readonly maintenant: Date
  }): Promise<
    Result<EmployeuseEnLieu, EchecDAjouterStructureEmployeuseEnLieu>
  > => {
    const actuelle = await consulterEmployeuseActuelle({ userId })

    if (actuelle === null) return failure(EmployeuseIntrouvable(userId))

    const { employeuse } = actuelle
    const employeuseId = EmployeuseId(employeuse.id)
    const trace = { userId, structureId: employeuse.id }

    if (!estLieuActivite) {
      const lieu = lieuDepuisEmployeuse({
        employeuse,
        adresseBan: null,
        maintenant,
      })

      await detacherDuLieuDecrit({ userId, lieu, trace })

      return success({ _tag: 'DetacheeDesLieux', lieu, trace })
    }

    const adresse = await lireLAdresseDeLEmployeuse(employeuseId)
    const geocodage: Geocodage =
      adresse === null
        ? { _tag: 'AdresseInconnue' }
        : await geocoderLAdresse(adresse)

    if (geocodage._tag === 'ServiceIndisponible')
      return failure(ServiceAdresseIndisponible(employeuseId))

    if (geocodage._tag === 'AdresseInconnue')
      return failure(AdresseNonReconnue(employeuseId))

    const lieu = lieuDepuisEmployeuse({
      employeuse,
      adresseBan: geocodage.adresse,
      maintenant,
    })

    await rattacherAuLieuDecrit({ userId, lieu, trace })

    return success({ _tag: 'RattacheeCommeLieu', lieu, trace })
  }
