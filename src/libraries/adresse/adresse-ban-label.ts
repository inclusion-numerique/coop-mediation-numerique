import { DefaultValues } from 'react-hook-form'
import { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'

// Failsafe function to display a label for an AdresseBanData
export const getAdresseBanLabel = ({
  nom,
  codePostal,
  commune,
}: Pick<
  DefaultValues<AdresseBanData>,
  'commune' | 'nom' | 'codePostal'
>): string => `${nom}, ${codePostal ? `${codePostal} ` : ''}${commune}`
