import type { Siret } from '@/libraries/insee'
import type { Result } from '@/libraries/result'
import type { EmployeuseId } from '../../../domain/employeuse-id'
import type { IdentiteEmployeuse } from '../../../domain/identite-employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { EmployeuseDuSiret } from './employeuse-du-siret'
import type { SireneIndisponible } from './errors'
import type { EtablissementSirene } from './etablissement-sirene'
import type { StatutDeConseillerNumerique } from './statut-de-conseiller-numerique'

export type LireLEtablissement = (
  siret: Siret,
) => Promise<Result<EtablissementSirene, SireneIndisponible>>

export type LireLeStatutDeConseillerNumerique = (
  userId: UtilisateurId,
) => Promise<StatutDeConseillerNumerique>

export type LireLesEmployeusesDuSiret = (
  siret: Siret,
) => Promise<readonly EmployeuseDuSiret[]>

export type CreerLEmployeuse = (
  identite: IdentiteEmployeuse,
) => Promise<EmployeuseId>

export type EnregistrerLeRattachement = (rattachement: {
  readonly userId: UtilisateurId
  readonly employeuseId: EmployeuseId
}) => Promise<void>

export type RattacherAUneEmployeusePorts = {
  readonly lireLEtablissement: LireLEtablissement
  readonly lireLeStatutDeConseillerNumerique: LireLeStatutDeConseillerNumerique
  readonly lireLesEmployeusesDuSiret: LireLesEmployeusesDuSiret
  readonly creerLEmployeuse: CreerLEmployeuse
  readonly enregistrerLeRattachement: EnregistrerLeRattachement
}
