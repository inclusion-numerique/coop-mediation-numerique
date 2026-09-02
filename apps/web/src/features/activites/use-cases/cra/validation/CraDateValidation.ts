import z from 'zod'

/**
 * Le dispositif Conseiller numérique a démarré le 17 novembre 2020 :
 * aucune activité ne peut lui être antérieure.
 */
export const debutDispositifConum = '2020-11-17'

export const CraDateValidation = z
  .string({ required_error: 'Veuillez renseigner une date' })
  .date('Veuillez renseigner une date valide')
  .refine((date) => date >= debutDispositifConum, {
    message:
      'La date ne peut pas être antérieure au 17/11/2020, début du dispositif Conseiller numérique',
  })
