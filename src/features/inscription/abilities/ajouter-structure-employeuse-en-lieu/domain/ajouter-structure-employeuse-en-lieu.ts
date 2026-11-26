import {
  LieuIntrouvable,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EmployeuseEnLieu } from './employeuse-en-lieu'
import {
  AdresseNonReconnue,
  type EchecDAjouterStructureEmployeuseEnLieu,
  EmployeuseIntrouvable,
  ServiceAdresseIndisponible,
} from './errors'
import { lieuDepuisEmployeuse } from './lieu-depuis-employeuse'
import type { AjouterStructureEmployeuseEnLieuPorts, Geocodage } from './ports'

export const ajouterStructureEmployeuseEnLieu =
  <Destination>({
    consulterEmployeuseActuelle,
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse,
    destinationDuLieuDecrit,
    rattacherAuLieuDecrit,
    lieuCorreleAuLieuDecrit,
    detacherDuLieu,
  }: AjouterStructureEmployeuseEnLieuPorts<Destination>) =>
  async ({
    userId,
    estLieuActivite,
    maintenant,
  }: {
    readonly userId: UtilisateurId
    readonly estLieuActivite: boolean
    readonly maintenant: Date
  }): Promise<
    Result<
      EmployeuseEnLieu<Destination>,
      EchecDAjouterStructureEmployeuseEnLieu
    >
  > => {
    const actuelle = await consulterEmployeuseActuelle({ userId })

    if (actuelle === null) return failure(EmployeuseIntrouvable(userId))

    const { employeuse } = actuelle
    const employeuseId = employeuse.id
    const trace = { userId, structureId: employeuse.id }

    if (!estLieuActivite) {
      const lieu = lieuDepuisEmployeuse({
        employeuse,
        adresseBan: null,
        maintenant,
      })

      const { data: lieuDetache } = await lieuCorreleAuLieuDecrit({ lieu })

      if (lieuDetache !== null)
        await detacherDuLieu({
          utilisateurId: userId,
          lieuId: lieuDetache,
          trace,
          maintenant,
        })

      return success({ _tag: 'DetacheeDesLieux', lieu, trace, lieuDetache })
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

    const { data: destination } = await destinationDuLieuDecrit({ lieu })

    const rattachement = await rattacherAuLieuDecrit({
      utilisateurId: userId,
      destination,
      trace,
      maintenant,
    })

    if (rattachement._tag === 'LieuDisparu')
      return failure(LieuIntrouvable(rattachement.lieuId))

    return success({ _tag: 'RattacheeCommeLieu', lieu, trace, destination })
  }
