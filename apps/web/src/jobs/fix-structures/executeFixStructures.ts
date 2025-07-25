import { searchAdresses } from '@app/web/external-apis/apiAdresse'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { fixTelephone, fixUrl } from '@app/web/utils/clean-operations'
import {
  Localisation,
  isValidTelephone,
  isValidUrl,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import proj4 from 'proj4'
import { FixStructuresJob } from './fixStructuresJob'

const isInvalidPivot = ({
  siret,
  rna,
}: {
  siret: string | null
  rna: string | null
}) => siret === '' || rna === ''

const toId = ({ id }: { id: string }) => id

const isInvalidTelephone = ({ telephone }: { telephone: string | null }) =>
  telephone && !isValidTelephone(telephone)

const fixLocationFormat = (localisation: {
  latitude: number | null
  longitude: number | null
}) => {
  proj4.defs(
    'EPSG:9793',
    '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
  )
  const [longitude, latitude]: [number, number] = proj4(
    'EPSG:9793',
    'EPSG:4326',
    [localisation.longitude ?? 0, localisation.latitude ?? 0],
  )
  return latitude == null || longitude == null
    ? {}
    : Localisation({ latitude, longitude })
}

const findLocationFor = async ({
  adresse,
  commune,
  codePostal,
}: {
  adresse: string
  commune: string
  codePostal: string
}) => {
  const adressesFound = await searchAdresses(
    commune === adresse ? commune : `${adresse}, ${codePostal} ${commune}`,
    commune === adresse ? { type: 'municipality' } : {},
  )

  const address = adressesFound.find(
    (feature) => feature.properties.score > 0.6,
  )

  return Localisation({
    latitude: address?.geometry.coordinates[1] ?? 0,
    longitude: address?.geometry.coordinates[0] ?? 0,
  })
}

const isLocationWrongFormat = ({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) =>
  (latitude != null && (latitude > 90 || latitude < -90)) ||
  (longitude != null && (longitude > 180 || longitude < -180))

const isInvalidLocation = ({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) =>
  (latitude === 0 && longitude === 0) || latitude == null || longitude == null

const isInvalidFicheAccesLibre = ({
  ficheAccesLibre,
}: {
  ficheAccesLibre: string | null
}) => ficheAccesLibre?.startsWith('https://acceslibre.beta.gouv.fr/static')

const isInvalidPriseRDV = ({ priseRdv }: { priseRdv: string | null }) =>
  priseRdv && !isValidUrl(priseRdv)

export const executeFixStructures = async (_job: FixStructuresJob) => {
  const structures = await prismaClient.structure.findMany()

  const invalidPivot = structures.filter(isInvalidPivot)

  output.log(`Found ${invalidPivot.length} structures with invalid pivot`)

  await prismaClient.structure.updateMany({
    where: {
      id: { in: invalidPivot.map(toId) },
    },
    data: {
      siret: null,
      rna: null,
    },
  })

  const invalidPhones = structures.filter(isInvalidTelephone)

  output.log(
    `Found ${invalidPhones.length} structures with invalid phone number`,
  )

  await Promise.all(
    invalidPhones.map(({ id, telephone }) =>
      prismaClient.structure.update({
        where: { id },
        data: { telephone: fixTelephone(telephone) },
      }),
    ),
  )

  const wrongFormatLocations = structures.filter(isLocationWrongFormat)

  output.log(
    `Found ${wrongFormatLocations.length} structures with invalid location format`,
  )

  await Promise.all(
    wrongFormatLocations.map(({ id, latitude, longitude }) =>
      prismaClient.structure.update({
        where: { id },
        data: fixLocationFormat({ latitude, longitude }),
      }),
    ),
  )

  const locations0 = structures.filter(isInvalidLocation)

  output.log(`Found ${locations0.length} structures with location set to 0,0`)

  await Promise.all(
    locations0.map(async (location) =>
      prismaClient.structure.update({
        where: { id: location.id },
        data: await findLocationFor(location),
      }),
    ),
  )

  const invalidFicheAccesLibre = structures.filter(isInvalidFicheAccesLibre)

  output.log(
    `Found ${invalidFicheAccesLibre.length} structures with invalid fiche acces libre`,
  )

  await prismaClient.structure.updateMany({
    where: {
      id: { in: invalidFicheAccesLibre.map(toId) },
    },
    data: {
      ficheAccesLibre: null,
    },
  })

  const invalidPriseRDV = structures.filter(isInvalidPriseRDV)

  output.log(`Found ${invalidPriseRDV.length} structures with invalid priseRdv`)

  await Promise.all(
    invalidPriseRDV.map(({ id, priseRdv }) =>
      prismaClient.structure.update({
        where: { id },
        data: { priseRdv: fixUrl(priseRdv) },
      }),
    ),
  )

  return {
    success: true,
  }
}
