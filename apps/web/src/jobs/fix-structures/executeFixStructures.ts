import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import {
  Localisation,
  isValidTelephone,
  isValidUrl,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import proj4 from 'proj4'
import {
  cleanTelephone,
  cleanUrl,
  toFixedTelephone,
  toFixedUrl,
} from './clean-operations'
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

const fixTelephone = (telephone: string | null) =>
  cleanTelephone(telephone).reduce(toFixedTelephone, telephone)

const fixUrl = (url: string | null) => cleanUrl(url).reduce(toFixedUrl, url)

const fixLocation = (localisation: {
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

const isInvalidLocation = ({
  latitude,
  longitude,
}: {
  latitude: number | null
  longitude: number | null
}) =>
  (latitude != null && (latitude > 90 || latitude < -90)) ||
  (longitude != null && (longitude > 180 || longitude < -180))

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

  const invalidLocations = structures.filter(isInvalidLocation)

  output.log(
    `Found ${invalidLocations.length} structures with invalid location`,
  )

  await Promise.all(
    invalidLocations.map(({ id, latitude, longitude }) =>
      prismaClient.structure.update({
        where: { id },
        data: fixLocation({ latitude, longitude }),
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
