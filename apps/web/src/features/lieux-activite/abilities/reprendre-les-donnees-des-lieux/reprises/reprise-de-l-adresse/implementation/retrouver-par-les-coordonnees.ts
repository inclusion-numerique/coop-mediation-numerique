import { apiAdresseEndpoint } from '@app/web/external-apis/apiAdresse'
import { distanceEnMetres } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { z } from 'zod'
import { interroger } from '../../../implementation/http/interroger'
import type {
  AdresseRetrouvee,
  AdresseSoumise,
  CoordonneesSoumises,
} from '../domain/adresse-a-reprendre'
import type { RetrouverParLesCoordonnees } from '../domain/reprise-de-l-adresse'
import { ligneDuTableau, lots } from './csv-de-la-ban'
import { rechercherLesVoies } from './geocoder-les-adresses'

const POINTS_PAR_LOT = 2000

const REVERSE = apiAdresseEndpoint.replace(/\/search$/u, '/reverse')

const TYPES_UTILISABLES: ReadonlySet<string> = new Set([
  'housenumber',
  'street',
  'locality',
])

/** Ce que la Base Adresse Nationale nomme au point, avant d'être situé. */
type VoieAuPoint = {
  readonly lieuId: string
  readonly voie: string
  readonly voieSansLeNumero: string
  readonly codeInsee: string
  readonly distance: number
}

const enCsv = (points: readonly CoordonneesSoumises[]): string =>
  [
    'lieu_id,latitude,longitude,code_insee',
    ...points.map(({ lieuId, latitude, longitude, codeInsee }) =>
      [lieuId, latitude, longitude, codeInsee ?? ''].join(','),
    ),
  ].join('\n')

const corps = (points: readonly CoordonneesSoumises[]): FormData => {
  const formulaire = new FormData()

  formulaire.append(
    'data',
    new Blob([enCsv(points)], { type: 'text/csv' }),
    'points.csv',
  )

  return formulaire
}

const voieAuPoint = (
  colonnes: readonly string[],
  ligne: readonly string[],
): readonly VoieAuPoint[] => {
  const champ = (nom: string): string =>
    ligne[colonnes.indexOf(nom)]?.trim() ?? ''

  if (champ('result_id') === '') return []
  if (!TYPES_UTILISABLES.has(champ('result_type'))) return []

  return [
    {
      lieuId: champ('lieu_id'),
      voie: champ('result_name'),
      voieSansLeNumero:
        champ('result_street') === ''
          ? champ('result_name')
          : champ('result_street'),
      codeInsee: champ('result_citycode'),
      distance: Number(champ('result_distance')),
    },
  ]
}

const soumettre = async (
  points: readonly CoordonneesSoumises[],
): Promise<readonly VoieAuPoint[]> => {
  const reponse = await interroger(`${REVERSE}/csv/`, {
    method: 'POST',
    body: corps(points),
  })

  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} au géocodage inverse d'un lot de ${points.length} points`,
    )

  return ligneDuTableau(await reponse.text(), voieAuPoint)
}

const aChercher = (trouvee: VoieAuPoint): AdresseSoumise => ({
  lieuId: trouvee.lieuId,
  voie: trouvee.voie,
  commune: '',
  codePostal: '',
  codeInsee: trouvee.codeInsee,
})

/**
 * La voie nommée au point, puis cherchée pour être située.
 *
 * Le géocodage inverse dit quelle adresse se trouve à un point et à quelle
 * distance, mais il n'en rend ni les coordonnées ni le code postal : sa réponse
 * ne suffirait pas à remplir une adresse. C'est la recherche de cette voie qui
 * donne l'entrée complète — et qui garantit que tout ce qu'on écrit vient de la
 * Base Adresse Nationale, coordonnées comprises, plutôt que du point de départ.
 */
type Position = { readonly latitude: number; readonly longitude: number }

const ReponseCommune = z.object({
  features: z.array(
    z.object({
      geometry: z.object({ coordinates: z.tuple([z.number(), z.number()]) }),
    }),
  ),
})

const cleDeLaCommune = ({ codeInsee, commune }: CoordonneesSoumises): string =>
  `${codeInsee ?? ''}|${commune}`

const centreDeLaCommune = async ({
  codeInsee,
  commune,
}: CoordonneesSoumises): Promise<Position | null> => {
  if (codeInsee == null || commune.trim() === '') return null

  const parametres = new URLSearchParams({
    q: commune,
    citycode: codeInsee,
    type: 'municipality',
    limit: '1',
  })
  const reponse = await interroger(
    `${apiAdresseEndpoint}?${parametres.toString()}`,
  )

  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} pour le centre de la commune ${codeInsee}`,
    )

  const [premiere] = ReponseCommune.parse(await reponse.json()).features

  return premiere == null
    ? null
    : {
        latitude: premiere.geometry.coordinates[1],
        longitude: premiere.geometry.coordinates[0],
      }
}

const centresDesCommunes = async (
  points: readonly CoordonneesSoumises[],
): Promise<ReadonlyMap<string, Position | null>> =>
  [
    ...new Map(points.map((point) => [cleDeLaCommune(point), point])).values(),
  ].reduce<Promise<ReadonlyMap<string, Position | null>>>(
    async (acquis, point) =>
      new Map([
        ...(await acquis),
        [cleDeLaCommune(point), await centreDeLaCommune(point)],
      ]),
    Promise.resolve(new Map()),
  )

const distanceAuCentre = (
  point: CoordonneesSoumises | undefined,
  centres: ReadonlyMap<string, Position | null>,
): number | null => {
  const centre = point == null ? null : centres.get(cleDeLaCommune(point))

  return point == null || centre == null
    ? null
    : Math.abs(distanceEnMetres(point, centre))
}

const situer = async (
  trouvees: readonly VoieAuPoint[],
  points: ReadonlyMap<string, CoordonneesSoumises>,
  centres: ReadonlyMap<string, Position | null>,
): Promise<readonly (readonly [string, AdresseRetrouvee])[]> => {
  const situees = new Map(
    await rechercherLesVoies(trouvees.map(aChercher), ['voie']),
  )

  return trouvees.flatMap((trouvee) => {
    const situee = situees.get(trouvee.lieuId)

    return situee == null || situee.codeInsee !== trouvee.codeInsee
      ? []
      : [
          [
            trouvee.lieuId,
            {
              ...situee,
              distance: trouvee.distance,
              voieSansLeNumero: trouvee.voieSansLeNumero,
              distanceAuCentreDeLaCommune: distanceAuCentre(
                points.get(trouvee.lieuId),
                centres,
              ),
            },
          ] as const,
        ]
  })
}

/**
 * Ce que la Base Adresse Nationale trouve aux points qu'on lui montre.
 *
 * Le recours quand l'adresse écrite ne suffit pas : des imports ont mis dans la
 * ligne de voie le nom de la commune ou celui du bâtiment, tout en posant des
 * coordonnées justes.
 */
export const retrouverParLesCoordonnees: RetrouverParLesCoordonnees = async (
  coordonnees,
) => {
  const trouvees = await lots(coordonnees, POINTS_PAR_LOT).reduce<
    Promise<readonly VoieAuPoint[]>
  >(
    async (acquis, lot) => [...(await acquis), ...(await soumettre(lot))],
    Promise.resolve([]),
  )
  const points = new Map(coordonnees.map((point) => [point.lieuId, point]))
  const centres = await centresDesCommunes(
    trouvees.flatMap(({ lieuId }) => {
      const point = points.get(lieuId)

      return point == null ? [] : [point]
    }),
  )

  return new Map(await situer(trouvees, points, centres))
}
