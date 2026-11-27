import { type Result, success } from '@/libraries/result'
import { contratsAuMoment } from '../../../domain/consultation/emploi-lu'
import {
  type EmployeuseActuelle,
  employeuseActuelle,
} from '../../../domain/consultation/employeuse-actuelle'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { ConsulterEmployeuseActuellePorts } from './ports'

export const consulterEmployeuseActuelle =
  ({ lireLEmploiActuel }: ConsulterEmployeuseActuellePorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<EmployeuseActuelle | null, never>> => {
    const emploi = await lireLEmploiActuel(utilisateurId)

    return success(
      emploi === null
        ? null
        : employeuseActuelle(
            emploi.affectationActuelle,
            contratsAuMoment(emploi.contrats, maintenant),
          ),
    )
  }
