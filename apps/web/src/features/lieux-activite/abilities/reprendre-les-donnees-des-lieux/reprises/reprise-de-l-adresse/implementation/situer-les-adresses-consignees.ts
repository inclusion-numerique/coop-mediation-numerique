import { z } from 'zod'
import type { AdresseConsignee } from '../domain/adresse-a-reprendre'
import type { SituerLesAdressesConsignees } from '../domain/reprise-de-l-adresse'
import adressesConsignees from './adresses-consignees.json'
import { rechercherLesVoies } from './geocoder-les-adresses'

const Consignation = z.object({
  lieuId: z.string().uuid(),
  nom: z.string(),
  adresse: z.string().min(1),
  codeInsee: z.string().regex(/^\d[\dAB]\d{3}$/u),
  source: z.string().url(),
})

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

    const situees = new Map(
      await rechercherLesVoies(
        consignees.map(({ lieuId, adresse, codeInsee }) => ({
          lieuId,
          voie: adresse,
          commune: '',
          codePostal: '',
          codeInsee,
        })),
        ['voie'],
      ),
    )

    return new Map(
      consignees.map(({ lieuId, codeInsee }): [string, AdresseConsignee] => [
        lieuId,
        { codeInsee, rendue: situees.get(lieuId) ?? null },
      ]),
    )
  }

export const situerLesAdressesDuRegistreLocal: SituerLesAdressesConsignees =
  situerLesAdressesConsignees(registreDesAdressesConsignees(adressesConsignees))
