import { prismaClient } from '@/configuration/prisma'
import { type Feature, siIndisponible } from '@/libraries/ban'
import { EmployeuseId } from '../../../../domain/employeuse-id'
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
}

export const creerLEmployeuse =
  ({ geocoder }: ServicesDeLEmployeuse): CreerLEmployeuse =>
  async ({ siret, denomination, adresse }) => {
    const source: AdresseSource = {
      adresse: adresse.voie ?? '',
      commune: adresse.commune,
      codePostal: adresse.codePostal ?? '',
      codeInsee: adresse.codeInsee ?? '',
    }

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

    return EmployeuseId(id)
  }
