import { getContractInfo } from '@app/web/conseiller-numerique/getContractInfo'
import type { LireLeContrat } from '../../domain'

export const lireLeContrat: LireLeContrat = async (acteurId) => {
  const contrat = await getContractInfo(acteurId)
  return contrat === null
    ? null
    : {
        type: contrat.type,
        debut: contrat.debut,
        fin: contrat.fin,
        echeance: contrat.finDeContrat,
      }
}
