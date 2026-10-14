import {
  addMonths,
  differenceInMonths,
  format,
  isBefore,
  isValid,
} from 'date-fns'
import {
  AlerteFinContrat,
  type ContratConseillerNumerique,
} from './contratConseillerNumerique'
import { lireContratsConseillerNumerique } from './lireContratsConseillerNumerique'

const formatDate = (date: Date | null) =>
  date && isValid(date) ? format(date, 'dd/MM/yyyy') : null

const typeWithDuration = ({
  type,
  debut,
  fin,
}: ContratConseillerNumerique): string =>
  debut && isValid(debut) && fin && isValid(fin)
    ? `${type} - Durée ${differenceInMonths(fin, debut)} mois`
    : (type ?? '')

const alerteFinDeContrat = ({ fin }: ContratConseillerNumerique) => {
  if (fin == null) {
    return null
  }
  if (isBefore(fin, new Date())) {
    return AlerteFinContrat.termine
  }
  if (isBefore(fin, addMonths(new Date(), 3))) {
    return AlerteFinContrat.prochainement
  }

  return null
}

export const getContractInfo = async (userId: string) =>
  lireContratsConseillerNumerique([userId]).then((contrats) => {
    const contrat = contrats.get(userId)
    if (!contrat) {
      return null
    }

    return {
      type: typeWithDuration(contrat),
      debut: formatDate(contrat.debut),
      fin: formatDate(contrat.fin),
      finDeContrat: alerteFinDeContrat(contrat),
    }
  })
