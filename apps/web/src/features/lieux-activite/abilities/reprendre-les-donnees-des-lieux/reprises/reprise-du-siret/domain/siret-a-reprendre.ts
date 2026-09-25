import { nettoyerNom, Siret } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { LieuAReprendre } from '../../../domain'
import type { AdresseGeocodee } from '../../reprise-de-l-adresse/domain/adresse-a-reprendre'
import { motsDeLaVoie } from './adresse-equivalente'
import { ressemblanceDesNoms } from './nom-ressemblant'

export const RESSEMBLANCE_MINIMALE_DES_NOMS = 65

export type EtablissementSirene = {
  readonly nom: string
  readonly voie: string
  readonly codePostal: string
  readonly commune: string
  readonly codeInsee: string
}

export type ReponseSirene =
  | { readonly etat: 'ouvert'; readonly etablissement: EtablissementSirene }
  | { readonly etat: 'ferme' }
  | { readonly etat: 'inconnu' }
  | { readonly etat: 'injoignable' }

export type Confrontation = {
  readonly siret: string
  readonly sirene: ReponseSirene
  readonly adresseRetenue: string | null
  readonly voieRetenue: string | null
  readonly inseeRetenu: string | null
  readonly adresseDuLieuALaVoie: boolean
  readonly adresseSirene: AdresseGeocodee | null
  readonly reponsesPourSirene: readonly AdresseGeocodee[]
}

export type SiretAReprendre =
  | {
      readonly verdict: 'a-effacer'
      readonly efface: string
      readonly motif: string
    }
  | { readonly verdict: 'a-corriger'; readonly corrige: string }
  | { readonly verdict: 'a-reverifier'; readonly motif: string }
  | {
      readonly verdict: 'a-renommer'
      readonly siret: string
      readonly nom: string
      readonly nomUsage: string
    }

export const MOTIFS_SIRET = {
  vide: 'vide',
  invalide: 'refusé par le standard',
  inconnu: 'inconnu de SIRENE',
  ferme: 'établissement fermé',
  autreAdresse: 'SIRENE le situe à une autre adresse',
  autreNom: 'SIRENE lui donne un autre nom',
  adresseNonFixee: "la reprise de l'adresse ne fixe pas celle du lieu",
  adresseALaVoie: "l'adresse du lieu s'arrête à la voie",
  adresseSireneALaVoie: "l'adresse SIRENE s'arrête à la voie",
  autreNumero: 'SIRENE lui donne un autre numéro dans la même voie',
  adresseSireneIntrouvable:
    "la Base Adresse Nationale ne reconnaît pas l'adresse SIRENE",
  injoignable: "SIRENE n'a pas répondu",
} as const

export const siretValide = (siret: string | null): string | null =>
  siret == null ? null : Siret.safe(siret)

const voieDe = (banId: string): string => banId.split('_').slice(0, 2).join('_')

const effacer = (siret: string, motif: string): SiretAReprendre => ({
  verdict: 'a-effacer',
  efface: siret,
  motif,
})

const reverifier = (motif: string): SiretAReprendre => ({
  verdict: 'a-reverifier',
  motif,
})

export const siretSansConfrontation = (
  lieu: LieuAReprendre,
): SiretAReprendre | null => {
  const siret = lieu.siret

  if (siret == null) return null
  if (siret.trim() === '') return effacer(siret, MOTIFS_SIRET.vide)
  if (siretValide(siret) == null) return effacer(siret, MOTIFS_SIRET.invalide)

  return null
}

const motifDeLAutreAdresse = (
  adresseSirene: AdresseGeocodee | null,
  adresseRetenue: string,
  adresseDuLieuALaVoie: boolean,
): string => {
  if (adresseSirene == null) return MOTIFS_SIRET.adresseSireneIntrouvable
  if (voieDe(adresseSirene.banId) !== voieDe(adresseRetenue))
    return MOTIFS_SIRET.autreAdresse
  if (adresseDuLieuALaVoie) return MOTIFS_SIRET.adresseALaVoie
  if (adresseSirene.type !== 'housenumber')
    return MOTIFS_SIRET.adresseSireneALaVoie

  return MOTIFS_SIRET.autreNumero
}

const verdictDeLaConfrontation = (
  lieu: LieuAReprendre,
  {
    siret,
    sirene,
    adresseRetenue,
    voieRetenue,
    inseeRetenu,
    adresseDuLieuALaVoie,
    adresseSirene,
    reponsesPourSirene,
  }: Confrontation,
): SiretAReprendre | null => {
  const brut = lieu.siret ?? siret

  if (sirene.etat === 'injoignable') return reverifier(MOTIFS_SIRET.injoignable)
  if (sirene.etat === 'inconnu') return effacer(brut, MOTIFS_SIRET.inconnu)
  if (sirene.etat === 'ferme') return effacer(brut, MOTIFS_SIRET.ferme)
  if (adresseRetenue == null) return effacer(brut, MOTIFS_SIRET.adresseNonFixee)

  const etablissement = sirene.etablissement
  const memeAdresse =
    reponsesPourSirene.some(({ banId }) => banId === adresseRetenue) ||
    (voieRetenue != null &&
      inseeRetenu === etablissement.codeInsee &&
      motsDeLaVoie(voieRetenue) === motsDeLaVoie(etablissement.voie))

  if (!memeAdresse)
    return effacer(
      brut,
      motifDeLAutreAdresse(adresseSirene, adresseRetenue, adresseDuLieuALaVoie),
    )

  const nom = nettoyerNom(etablissement.nom)
  const nomDuLieu = nettoyerNom(lieu.nom)

  if (ressemblanceDesNoms(nomDuLieu, nom) < RESSEMBLANCE_MINIMALE_DES_NOMS)
    return effacer(brut, MOTIFS_SIRET.autreNom)
  if (nom !== nomDuLieu)
    return { verdict: 'a-renommer', siret, nom, nomUsage: nomDuLieu }
  if (siret !== lieu.siret) return { verdict: 'a-corriger', corrige: siret }

  return null
}

export const siretAReprendre = (
  lieu: LieuAReprendre,
  confrontation: Confrontation | undefined,
): SiretAReprendre | null =>
  siretSansConfrontation(lieu) ??
  (confrontation == null ? null : verdictDeLaConfrontation(lieu, confrontation))
