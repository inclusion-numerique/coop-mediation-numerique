import { z } from 'zod'
import { interroger } from '../../../implementation/http/interroger'
import type {
  AdresseConsignee,
  AdresseGeocodee,
} from '../domain/adresse-a-reprendre'
import type { SituerLesAdressesConsignees } from '../domain/reprise-de-l-adresse'
import adressesConsignees from './adresses-consignees.json'
import { rechercherLesVoies } from './geocoder-les-adresses'

const CONSULTATION_PAR_IDENTIFIANT =
  'https://plateforme.adresse.data.gouv.fr/lookup'

const Consignation = z.object({
  lieuId: z.string().uuid(),
  nom: z.string(),
  adresse: z.string().min(1),
  codeInsee: z.string().regex(/^\d[\dAB]\d{3}$/u),
  banId: z.string().min(1).optional(),
  complementAdresse: z.string().min(1).optional(),
  source: z.string().url(),
})

const NumeroDeLaBan = z.object({
  type: z.literal('numero'),
  cleInterop: z.string().min(1),
  numero: z.number(),
  suffixe: z.string().nullish(),
  lat: z.number(),
  lon: z.number(),
  codePostal: z.string().min(1),
  voie: z.object({ nomVoie: z.string().min(1) }),
  commune: z.object({ code: z.string().min(1), nom: z.string().min(1) }),
})

export const adresseDuNumero = (reponse: unknown): AdresseGeocodee | null => {
  const lu = NumeroDeLaBan.safeParse(reponse)

  if (!lu.success) return null

  const { cleInterop, numero, suffixe, lat, lon, codePostal, voie, commune } =
    lu.data
  const voieNumerotee = `${numero}${suffixe ?? ''} ${voie.nomVoie}`

  return {
    type: 'housenumber',
    score: 1,
    banId: cleInterop,
    voie: voieNumerotee,
    commune: commune.nom,
    codePostal,
    codeInsee: commune.code,
    ancienCodeInsee: '',
    latitude: lat,
    longitude: lon,
    libelle: `${voieNumerotee} ${codePostal} ${commune.nom}`,
  }
}

const consulterParIdentifiant = async (
  banId: string,
): Promise<AdresseGeocodee | null> => {
  const reponse = await interroger(
    `${CONSULTATION_PAR_IDENTIFIANT}/${encodeURIComponent(banId)}`,
  )

  if (reponse.status === 404) return null
  if (!reponse.ok)
    throw new Error(
      `La Base Adresse Nationale a répondu ${reponse.status} à la consultation de l'adresse ${banId}`,
    )

  return adresseDuNumero(await reponse.json())
}

const parIdentifiant = async (
  consignees: readonly Consignation[],
): Promise<readonly (readonly [string, AdresseGeocodee])[]> =>
  consignees.reduce<Promise<readonly (readonly [string, AdresseGeocodee])[]>>(
    async (acquises, { lieuId, banId }) => {
      const rendue = banId == null ? null : await consulterParIdentifiant(banId)

      return rendue == null
        ? acquises
        : [...(await acquises), [lieuId, rendue] as const]
    },
    Promise.resolve([]),
  )

type Consignation = z.infer<typeof Consignation>

export const registreDesAdressesConsignees = (
  entrees: unknown,
): ReadonlyMap<string, Consignation> =>
  new Map(
    z
      .array(Consignation)
      .parse(entrees)
      .map((consignation) => [consignation.lieuId, consignation]),
  )

export const situerLesAdressesConsignees =
  (registre: ReadonlyMap<string, Consignation>): SituerLesAdressesConsignees =>
  async (lieuIds) => {
    const consignees = lieuIds.flatMap((lieuId) => {
      const consignation = registre.get(lieuId)

      return consignation == null ? [] : [consignation]
    })

    const parLaRecherche = new Map(
      await rechercherLesVoies(
        consignees
          .filter(({ banId }) => banId == null)
          .map(({ lieuId, adresse, codeInsee }) => ({
            lieuId,
            voie: adresse,
            commune: '',
            codePostal: '',
            codeInsee,
          })),
        ['voie'],
      ),
    )

    const situees = new Map([
      ...parLaRecherche,
      ...(await parIdentifiant(
        consignees.filter(({ banId }) => banId != null),
      )),
    ])

    return new Map(
      consignees.map(
        ({
          lieuId,
          codeInsee,
          complementAdresse,
        }): [string, AdresseConsignee] => [
          lieuId,
          {
            codeInsee,
            rendue: situees.get(lieuId) ?? null,
            complement: complementAdresse ?? null,
          },
        ],
      ),
    )
  }

export const situerLesAdressesDuRegistreLocal: SituerLesAdressesConsignees =
  situerLesAdressesConsignees(registreDesAdressesConsignees(adressesConsignees))
