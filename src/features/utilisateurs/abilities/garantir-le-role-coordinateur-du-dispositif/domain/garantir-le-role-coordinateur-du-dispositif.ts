import { type Result, success } from '@/libraries/result'
import type { GarantirLeRoleCoordinateurDuDispositifPorts } from './ports'

export type GarantieDuRoleCoordinateur =
  | { readonly _tag: 'DejaCoordinateur' }
  | { readonly _tag: 'HorsDuDispositif' }
  | { readonly _tag: 'RoleCree'; readonly utilisateurId: string }

export const garantirLeRoleCoordinateurDuDispositif =
  ({
    aLeRoleCoordinateur,
    coordonneDansLeDispositif,
    creerLeRoleCoordinateur,
  }: GarantirLeRoleCoordinateurDuDispositifPorts) =>
  async ({
    utilisateurId,
  }: {
    readonly utilisateurId: string
  }): Promise<Result<GarantieDuRoleCoordinateur, never>> => {
    if (await aLeRoleCoordinateur(utilisateurId))
      return success({ _tag: 'DejaCoordinateur' })

    if (!(await coordonneDansLeDispositif(utilisateurId)))
      return success({ _tag: 'HorsDuDispositif' })

    await creerLeRoleCoordinateur(utilisateurId)

    return success({ _tag: 'RoleCree', utilisateurId })
  }
