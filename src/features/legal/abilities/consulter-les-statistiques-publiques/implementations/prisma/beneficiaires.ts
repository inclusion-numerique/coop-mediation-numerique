import { getBeneficiairesData } from './donnees-des-beneficiaires.query'
import { getTotalBeneficiaires } from './total-des-beneficiaires.query'

export const getBeneficiaires = async () => {
  const [beneficiaires, beneficiairesData] = await Promise.all([
    getTotalBeneficiaires(),
    getBeneficiairesData(),
  ])

  return {
    total: beneficiaires.total,
    series: [
      {
        label: 'Bénéficiaires suivis',
        key: 'byBeneficiairesSuivis',
        ...beneficiaires.byBeneficiairesSuivis,
      },
      {
        label: 'Bénéficiaires anonymes',
        key: 'byBeneficiairesAnonymes',
        ...beneficiaires.byBeneficiairesAnonymes,
      },
    ],
    ...beneficiairesData,
  }
}
