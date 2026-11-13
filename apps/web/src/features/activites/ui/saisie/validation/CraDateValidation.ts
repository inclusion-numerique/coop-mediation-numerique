import z from 'zod'
import {
  DateDActivite,
  derniereDateDActivite,
  PREMIERE_DATE_D_ACTIVITE,
} from '../../../domain'

export const debutDispositifConum = PREMIERE_DATE_D_ACTIVITE

const aujourdhuiDansLeFuseauDuNavigateur = (): DateDActivite => {
  const maintenant = new Date()
  const mois = `${maintenant.getMonth() + 1}`.padStart(2, '0')
  const jour = `${maintenant.getDate()}`.padStart(2, '0')
  return DateDActivite(`${maintenant.getFullYear()}-${mois}-${jour}`)
}

export const derniereDateDuFormulaire = (): DateDActivite =>
  derniereDateDActivite(aujourdhuiDansLeFuseauDuNavigateur())

export const CraDateValidation = z
  .string({ error: 'Veuillez renseigner une date' })
  .date('Veuillez renseigner une date valide')
  .refine((date) => date >= debutDispositifConum, {
    message:
      'La date ne peut pas être antérieure au 17/11/2020, début du dispositif Conseiller numérique',
  })
  .refine((date) => date <= derniereDateDuFormulaire(), {
    message: 'La date ne peut pas dépasser deux ans à partir d’aujourd’hui',
  })
