import { prismaClient } from '@app/web/prismaClient'
import type { LireLAdresseDeLEmployeuse } from '../domain/ports'

export const lireLAdresseDeLEmployeuse: LireLAdresseDeLEmployeuse = async (
  employeuseId,
) => {
  const structure = await prismaClient.structureAdministrativeMain.findUnique({
    where: { id: employeuseId },
    select: {
      adresse: {
        select: {
          numeroVoie: true,
          repetition: true,
          nomVoie: true,
          codePostal: true,
          codeInsee: true,
          nomCommune: true,
        },
      },
    },
  })

  const adresse = structure?.adresse

  if (adresse == null) return null

  return {
    adresse: [adresse.numeroVoie, adresse.repetition, adresse.nomVoie]
      .filter((partie) => partie != null && `${partie}` !== '')
      .join(' '),
    codePostal: adresse.codePostal,
    commune: adresse.nomCommune,
    codeInsee: adresse.codeInsee,
  }
}
