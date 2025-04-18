import { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { DefaultValues } from 'react-hook-form'

// Failsafe function to display a label for an AdresseBanData
export const getAdresseBanLabel = ({
  nom,
  codePostal,
  commune,
}: Pick<
  DefaultValues<AdresseBanData>,
  'commune' | 'nom' | 'codePostal'
>): string => `${nom}, ${codePostal ? `${codePostal} ` : ''}${commune}`
