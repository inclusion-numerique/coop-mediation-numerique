import type { LieuAReprendre, Reprise } from '../../../domain'
import { repriseAvecPrealable } from '../../../domain'
import {
  type AdresseGeocodee,
  adresseAReprendre,
  adresseDeLAdresse,
  adresseSoumise,
  confieeAuLieuSiInactif,
} from '../../reprise-de-l-adresse/domain/adresse-a-reprendre'
import {
  type AdressesRendues,
  adressesRendues,
  type ConsulterLAnnuaire,
  type GeocoderLesAdresses,
  type RetrouverParLesCoordonnees,
  type SituerLesAdressesConsignees,
} from '../../reprise-de-l-adresse/domain/reprise-de-l-adresse'
import {
  type ConfrontationConsignee,
  confrontationConsignee,
} from './confrontation-consignee'
import {
  type Confrontation,
  type EtablissementSirene,
  type ReponseSirene,
  type SiretAReprendre,
  siretAReprendre,
  siretSansConfrontation,
  siretValide,
} from './siret-a-reprendre'

const COLONNE = 'siret'

const A_CORRIGER = 'à corriger'

const A_EFFACER = 'à effacer'

const A_REVERIFIER = 'à revérifier'

const NOM_REPRIS = 'nom repris de SIRENE'

export type InterrogerSirene = (siret: string) => Promise<ReponseSirene>

export type ReprendreLeSiret = (
  lieuId: string,
  aReprendre: SiretAReprendre,
) => Promise<void>

export type ConsignerLesConfrontations = (
  confrontations: readonly ConfrontationConsignee[],
) => Promise<void>

export type PortsDuSiret = {
  readonly geocoderLesAdresses: GeocoderLesAdresses
  readonly retrouverParLesCoordonnees: RetrouverParLesCoordonnees
  readonly situerLesAdressesConsignees: SituerLesAdressesConsignees
  readonly consulterLAnnuaire: ConsulterLAnnuaire
  readonly interrogerSirene: InterrogerSirene
  readonly reprendreLeSiret: ReprendreLeSiret
  readonly consignerLesConfrontations: ConsignerLesConfrontations
  readonly maintenant: Date
}

type AdresseDuLieu = {
  readonly banId: string | null
  readonly voie: string | null
  readonly codeInsee: string | null
  readonly alaVoie: boolean
}

const UNE_PLAQUE = 'housenumber'

const adresseRetenue = (
  lieu: LieuAReprendre,
  rendues: AdressesRendues,
  maintenant: Date,
): AdresseDuLieu => {
  const verdict = confieeAuLieuSiInactif(
    lieu,
    adresseAReprendre(
      lieu,
      rendues.parLAdresse.get(lieu.id) ?? [],
      rendues.parLesCoordonnees.get(lieu.id),
      rendues.parLAnnuaire.get(lieu.id) ?? [],
      rendues.parLeRegistre.get(lieu.id),
    ),
    maintenant,
  )

  if (verdict == null)
    return {
      banId: lieu.banId,
      voie: lieu.adresse,
      codeInsee: lieu.codeInsee,
      alaVoie: (lieu.banId ?? '').split('_').length < 3,
    }

  return 'adresse' in verdict
    ? {
        banId: verdict.adresse.banId,
        voie: verdict.adresse.voie,
        codeInsee: verdict.adresse.codeInsee,
        alaVoie: verdict.adresse.type !== UNE_PLAQUE,
      }
    : { banId: null, voie: null, codeInsee: null, alaVoie: false }
}

const lieuDeSirene = (
  lieu: LieuAReprendre,
  { voie, codePostal, commune, codeInsee }: EtablissementSirene,
): LieuAReprendre => ({
  ...lieu,
  adresse: voie,
  codePostal,
  commune,
  codeInsee,
  banId: null,
  latitude: null,
  longitude: null,
})

const interrogerChacun = async (
  sirets: readonly string[],
  interrogerSirene: InterrogerSirene,
): Promise<ReadonlyMap<string, ReponseSirene>> =>
  sirets.reduce<Promise<ReadonlyMap<string, ReponseSirene>>>(
    async (acquises, siret) =>
      new Map([...(await acquises), [siret, await interrogerSirene(siret)]]),
    Promise.resolve(new Map()),
  )

const confrontations =
  (ports: PortsDuSiret) =>
  async (
    lieux: readonly LieuAReprendre[],
  ): Promise<ReadonlyMap<string, Confrontation>> => {
    const aConfronter = lieux.filter(
      (lieu) =>
        siretSansConfrontation(lieu) == null && siretValide(lieu.siret) != null,
    )

    const rendues = await adressesRendues(
      ports.geocoderLesAdresses,
      ports.retrouverParLesCoordonnees,
      ports.situerLesAdressesConsignees,
      ports.consulterLAnnuaire,
    )(aConfronter)

    const reponses = await interrogerChacun(
      [
        ...new Set(
          aConfronter.flatMap(({ siret }) => siretValide(siret) ?? []),
        ),
      ],
      ports.interrogerSirene,
    )

    const siretDe = (lieu: LieuAReprendre): string =>
      siretValide(lieu.siret) ?? ''

    const deSirene = aConfronter.flatMap((lieu) => {
      const reponse = reponses.get(siretDe(lieu))

      return reponse?.etat === 'ouvert'
        ? [lieuDeSirene(lieu, reponse.etablissement)]
        : []
    })

    const parLaSirene = await ports.geocoderLesAdresses(
      deSirene.map(adresseSoumise),
    )

    const adressesSirene = new Map(
      deSirene.map((lieu): [string, AdresseGeocodee | null] => [
        lieu.id,
        adresseDeLAdresse(lieu, parLaSirene.get(lieu.id) ?? []),
      ]),
    )

    const parLieu = new Map(
      aConfronter.map((lieu): [string, Confrontation] => {
        const retenue = adresseRetenue(lieu, rendues, ports.maintenant)

        return [
          lieu.id,
          {
            siret: siretDe(lieu),
            sirene: reponses.get(siretDe(lieu)) ?? { etat: 'injoignable' },
            adresseRetenue: retenue.banId,
            voieRetenue: retenue.voie,
            inseeRetenu: retenue.codeInsee,
            adresseDuLieuALaVoie: retenue.alaVoie,
            adresseSirene: adressesSirene.get(lieu.id) ?? null,
            reponsesPourSirene: parLaSirene.get(lieu.id) ?? [],
          },
        ]
      }),
    )

    await ports.consignerLesConfrontations(
      lieux
        .filter(({ siret }) => siret != null)
        .map((lieu) =>
          confrontationConsignee(
            lieu,
            parLieu.get(lieu.id),
            siretAReprendre(lieu, parLieu.get(lieu.id)),
          ),
        ),
    )

    return parLieu
  }

const cellule = (aReprendre: SiretAReprendre): string => {
  if (aReprendre.verdict === 'a-effacer')
    return JSON.stringify(aReprendre.efface)
  if (aReprendre.verdict === 'a-corriger') return A_CORRIGER
  if (aReprendre.verdict === 'a-renommer') return NOM_REPRIS

  return `${A_REVERIFIER} : ${aReprendre.motif}`
}

const motif = (aReprendre: SiretAReprendre): string => {
  if (aReprendre.verdict === 'a-effacer')
    return `${COLONNE} : ${A_EFFACER}, ${aReprendre.motif}`
  if (aReprendre.verdict === 'a-corriger') return `${COLONNE} : ${A_CORRIGER}`
  if (aReprendre.verdict === 'a-renommer') return `${COLONNE} : ${NOM_REPRIS}`

  return `${COLONNE} : ${A_REVERIFIER}, ${aReprendre.motif}`
}

export const repriseDuSiret = (ports: PortsDuSiret): Reprise =>
  repriseAvecPrealable<SiretAReprendre, ReadonlyMap<string, Confrontation>>({
    colonnes: [COLONNE],
    preparer: confrontations(ports),
    constater: (lieu, parLieu) => siretAReprendre(lieu, parLieu.get(lieu.id)),
    mentions: (aReprendre) => [
      {
        colonne: COLONNE,
        cellule: cellule(aReprendre),
        motif: motif(aReprendre),
      },
    ],
    appliquer: (lieuId, aReprendre) =>
      aReprendre.verdict === 'a-reverifier'
        ? Promise.resolve()
        : ports.reprendreLeSiret(lieuId, aReprendre),
  })
