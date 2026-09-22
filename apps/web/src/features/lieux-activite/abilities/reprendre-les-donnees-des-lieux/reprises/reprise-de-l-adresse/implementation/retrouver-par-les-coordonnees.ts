import { apiAdresseEndpoint } from '@app/web/external-apis/apiAdresse'
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
  const reponse = await fetch(`${REVERSE}/csv/`, {
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
const situer = async (
  trouvees: readonly VoieAuPoint[],
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
) =>
  new Map(
    await situer(
      await lots(coordonnees, POINTS_PAR_LOT).reduce<
        Promise<readonly VoieAuPoint[]>
      >(
        async (acquis, lot) => [...(await acquis), ...(await soumettre(lot))],
        Promise.resolve([]),
      ),
    ),
  )
