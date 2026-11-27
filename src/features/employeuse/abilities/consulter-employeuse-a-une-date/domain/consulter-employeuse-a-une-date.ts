import { type Result, success } from '@/libraries/result'
import { contratsAuMoment } from '../../../domain/consultation/emploi-lu'
import { employeuseALaDate } from '../../../domain/consultation/employeuse-a-la-date'
import type { Employeuse } from '../../../domain/employeuse'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { ConsulterEmployeuseAUneDatePorts } from './ports'

export const consulterEmployeuseAUneDate =
  ({ lireLEmploiActuel }: ConsulterEmployeuseAUneDatePorts) =>
  async ({
    utilisateurId,
    date,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly date: Date
    readonly maintenant: Date
  }): Promise<Result<Employeuse | null, never>> => {
    const emploi = await lireLEmploiActuel(utilisateurId)

    return success(
      emploi === null
        ? null
        : employeuseALaDate(
            emploi.affectationActuelle?.employeuse ?? null,
            contratsAuMoment(emploi.contrats, maintenant),
            date,
          ),
    )
  }
