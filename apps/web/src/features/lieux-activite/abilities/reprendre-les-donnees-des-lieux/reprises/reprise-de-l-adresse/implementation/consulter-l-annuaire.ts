import { z } from 'zod'
import { interroger } from '../../../implementation/http/interroger'
import type {
  AdresseGeocodee,
  AdresseSoumise,
  ServiceDemande,
} from '../domain/adresse-a-reprendre'
import type { ConsulterLAnnuaire } from '../domain/reprise-de-l-adresse'
import { rechercherLesVoies } from './geocoder-les-adresses'

const ANNUAIRE =
  'https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records'

const SERVICES_PAR_COMMUNE = 100

const ADRESSE_PHYSIQUE = 'Adresse'

const SEPARATEUR = '|'

const EnJson = <T extends z.ZodType>(schema: T) =>
  z
    .string()
    .nullable()
    .transform((texte, contexte) => {
      try {
        const lu: unknown = JSON.parse(texte ?? '[]')

        return lu
      } catch {
        contexte.addIssue({ code: 'custom', message: 'JSON illisible' })
        return z.NEVER
      }
    })
    .pipe(schema)

const ServiceDeLAnnuaire = z.object({
  pivot: EnJson(z.array(z.object({ type_service_local: z.string() }))),
  adresse: EnJson(
    z.array(
      z.object({
        type_adresse: z.string(),
        numero_voie: z.string().nullish(),
      }),
    ),
  ),
})

type ServiceDeLAnnuaire = z.infer<typeof ServiceDeLAnnuaire>

const ReponseDeLAnnuaire = z.object({
  results: z.array(ServiceDeLAnnuaire),
})

const servicesDeLaCommune = async (
  codeInsee: string,
): Promise<readonly ServiceDeLAnnuaire[]> => {
  const parametres = new URLSearchParams({
    where: `code_insee_commune="${codeInsee}"`,
    select: 'pivot,adresse',
    limit: String(SERVICES_PAR_COMMUNE),
  })

  const reponse = await interroger(`${ANNUAIRE}?${parametres.toString()}`)

  if (!reponse.ok)
    throw new Error(
      `L'Annuaire de l'administration a répondu ${reponse.status} pour la commune ${codeInsee}`,
    )

  return ReponseDeLAnnuaire.parse(await reponse.json()).results
}

const voieDuService = (service: ServiceDeLAnnuaire): string =>
  (
    service.adresse.find(
      ({ type_adresse }) => type_adresse === ADRESSE_PHYSIQUE,
    )?.numero_voie ?? ''
  )
    .replaceAll(/(?<=\p{L})-(?=\p{L})/gu, ' ')
    .trim()

const estDuType =
  (demande: ServiceDemande) =>
  (service: ServiceDeLAnnuaire): boolean =>
    service.pivot.some(
      ({ type_service_local }) => type_service_local === demande.service,
    )

const communesDistinctes = (
  demandes: readonly ServiceDemande[],
): readonly string[] => [...new Set(demandes.map(({ codeInsee }) => codeInsee))]

const annuaireParCommune = async (
  demandes: readonly ServiceDemande[],
): Promise<ReadonlyMap<string, readonly ServiceDeLAnnuaire[]>> =>
  communesDistinctes(demandes).reduce<
    Promise<ReadonlyMap<string, readonly ServiceDeLAnnuaire[]>>
  >(
    async (acquis, codeInsee) =>
      new Map([
        ...(await acquis),
        [codeInsee, await servicesDeLaCommune(codeInsee)],
      ]),
    Promise.resolve(new Map()),
  )

const aChercher = (
  demande: ServiceDemande,
  voies: readonly string[],
): readonly AdresseSoumise[] =>
  voies.flatMap((voie, rang) =>
    voie === ''
      ? []
      : [
          {
            lieuId: `${demande.lieuId}${SEPARATEUR}${rang}`,
            voie,
            commune: '',
            codePostal: '',
            codeInsee: demande.codeInsee,
          },
        ],
  )

export const consulterLAnnuaire: ConsulterLAnnuaire = async (demandes) => {
  const annuaire = await annuaireParCommune(demandes)

  const voiesDemandees = demandes.map(
    (demande) =>
      [
        demande,
        (annuaire.get(demande.codeInsee) ?? [])
          .filter(estDuType(demande))
          .map(voieDuService),
      ] as const,
  )

  const situees: ReadonlyMap<string, AdresseGeocodee> = new Map(
    await rechercherLesVoies(
      voiesDemandees.flatMap(([demande, voies]) => aChercher(demande, voies)),
      ['voie'],
    ),
  )

  return new Map(
    voiesDemandees.map(([demande, voies]) => [
      demande.lieuId,
      voies.map(
        (_voie, rang) =>
          situees.get(`${demande.lieuId}${SEPARATEUR}${rang}`) ?? null,
      ),
    ]),
  )
}
