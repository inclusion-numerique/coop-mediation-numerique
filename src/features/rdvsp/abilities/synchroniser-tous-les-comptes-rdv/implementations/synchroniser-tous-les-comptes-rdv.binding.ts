import {
  type DeclencherLaSynchronisation,
  synchroniserTousLesComptesRdv,
} from '../domain/synchroniser-tous-les-comptes-rdv'
import { lireLesComptesRdv } from './prisma/comptes-rdv.query'

export const synchroniserTousLesComptesRdvAvec = (
  declencher: DeclencherLaSynchronisation,
) =>
  synchroniserTousLesComptesRdv({
    lireLesComptes: lireLesComptesRdv,
    declencher,
  })
