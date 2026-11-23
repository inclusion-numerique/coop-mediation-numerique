import {
  type AjouterStructureEmployeuseEnLieuPorts,
  ajouterStructureEmployeuseEnLieu,
} from '../domain/ajouter-structure-employeuse-en-lieu'
import { geocoderLAdresse } from './ban/geocoder-l-adresse'
import { lireLAdresseDeLEmployeuse } from './prisma/adresse-de-l-employeuse.query'

export const ajouterStructureEmployeuseEnLieuAvec = (
  ports: Pick<
    AjouterStructureEmployeuseEnLieuPorts,
    | 'consulterEmployeuseActuelle'
    | 'rattacherAuLieuDecrit'
    | 'detacherDuLieuDecrit'
  >,
) =>
  ajouterStructureEmployeuseEnLieu({
    ...ports,
    lireLAdresseDeLEmployeuse,
    geocoderLAdresse,
  })
