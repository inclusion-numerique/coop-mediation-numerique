import { getBeneficiairesData } from './get-beneficiaires-data'
import { getTotalBeneficiaires } from './get-total-beneficiaires'

export const getBeneficiaires = async () => {
  const beneficiaires = await getTotalBeneficiaires()
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
    ...(await getBeneficiairesData()),
  }
}
