import type { Siret } from '@/libraries/insee'
import type { Result } from '@/libraries/result'
import type { EmployeuseId } from '../../../domain/employeuse-id'
import type {
  EtablissementSirene,
  IdentiteEmployeuse,
} from '../../../domain/identite-employeuse'
import type { EmployeuseDuSiret } from './employeuse-du-siret'
import type { EmployeuseIndisponible } from './errors'

export type LireLEtablissement = (
  siret: string,
) => Promise<Result<EtablissementSirene, EmployeuseIndisponible>>

export type EstConseillerNumeriqueEnPoste = (
  userId: string,
) => Promise<boolean | null>

export type LireLesEmployeusesDuSiret = (
  siret: Siret,
) => Promise<Result<readonly EmployeuseDuSiret[], EmployeuseIndisponible>>

export type CreerLEmployeuse = (
  identite: IdentiteEmployeuse,
) => Promise<Result<EmployeuseId, EmployeuseIndisponible>>

export type EnregistrerLeRattachement = (rattachement: {
  readonly userId: string
  readonly employeuseId: EmployeuseId
}) => Promise<void>

export type RattacherAUneEmployeusePorts = {
  readonly lireLEtablissement: LireLEtablissement
  readonly estConseillerNumeriqueEnPoste: EstConseillerNumeriqueEnPoste
  readonly lireLesEmployeusesDuSiret: LireLesEmployeusesDuSiret
  readonly creerLEmployeuse: CreerLEmployeuse
  readonly enregistrerLeRattachement: EnregistrerLeRattachement
}
