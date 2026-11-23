import {
  type DeclencherLaSynchronisation,
  synchroniserTousLesComptesRdv,
} from '../commands/synchroniser-tous-les-comptes-rdv'
import { lireLesComptesRdv } from './prisma/comptes-rdv.query'

export const synchroniserTousLesComptesRdvAvec = (
  declencher: DeclencherLaSynchronisation,
) =>
  synchroniserTousLesComptesRdv({
    lireLesComptes: lireLesComptesRdv,
    declencher,
  })
