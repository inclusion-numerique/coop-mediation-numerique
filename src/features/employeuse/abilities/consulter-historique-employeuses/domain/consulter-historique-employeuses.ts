import { type Result, success } from '@/libraries/result'
import { contratsAuMoment } from '../../../domain/consultation/emploi-lu'
import {
  type EmployeuseHistorique,
  employeusesHistorique,
} from '../../../domain/consultation/employeuses-historique'
import type { UtilisateurId } from '../../../domain/utilisateur-id'
import type { ConsulterHistoriqueEmployeusesPorts } from './ports'

export const consulterHistoriqueEmployeuses =
  ({ lireLHistoriqueDEmploi }: ConsulterHistoriqueEmployeusesPorts) =>
  async ({
    utilisateurId,
    maintenant,
  }: {
    readonly utilisateurId: UtilisateurId
    readonly maintenant: Date
  }): Promise<Result<readonly EmployeuseHistorique[], never>> => {
    const historique = await lireLHistoriqueDEmploi(utilisateurId)

    return success(
      historique === null
        ? []
        : employeusesHistorique(
            historique.affectations,
            contratsAuMoment(historique.contrats, maintenant),
          ),
    )
  }
