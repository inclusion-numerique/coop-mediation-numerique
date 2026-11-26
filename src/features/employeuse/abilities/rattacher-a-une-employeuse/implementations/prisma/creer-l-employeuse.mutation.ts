import { prismaClient } from '@/configuration/prisma'
import { type Feature, siIndisponible } from '@/libraries/ban'
import { failure, success } from '@/libraries/result'
import { EmployeuseId } from '../../../../domain/employeuse-id'
import { EmployeuseIndisponible } from '../../domain/errors'
import type { CreerLEmployeuse } from '../../domain/ports'
import {
  type AdresseSource,
  adresseMainDepuis,
  idDeLAdresseMain,
  insertAdresseMain,
  requeteDeGeocodage,
} from './adresse-main.query'

export type ServicesDeLEmployeuse = {
  readonly geocoder: (requete: string) => Promise<Feature | null>
  readonly signaler: (erreur: unknown) => void
}

export const creerLEmployeuse =
  ({ geocoder, signaler }: ServicesDeLEmployeuse): CreerLEmployeuse =>
  async ({ siret, denomination, adresse }) => {
    const source: AdresseSource = {
      adresse: adresse.voie ?? '',
      commune: adresse.commune,
      codePostal: adresse.codePostal ?? '',
      codeInsee: adresse.codeInsee ?? '',
    }

    try {
      const feature = await geocoder(requeteDeGeocodage(source)).catch(
        siIndisponible(null),
      )
      const adresseMain = adresseMainDepuis(source, feature)
      const adresseId =
        (await idDeLAdresseMain(adresseMain))?.id ??
        (await insertAdresseMain(adresseMain))

      const { id } = await prismaClient.structureAdministrativeMain.create({
        data: { siret, denominationAntenne: denomination, adresseId },
        select: { id: true },
      })

      return success(EmployeuseId(id))
    } catch (erreur) {
      signaler(erreur)
      return failure(EmployeuseIndisponible())
    }
  }
