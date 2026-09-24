import type { LieuAReprendre } from '../../../domain'
import { ressemblanceDesNoms } from './nom-ressemblant'
import type { Confrontation, SiretAReprendre } from './siret-a-reprendre'

export type ConfrontationConsignee = Readonly<Record<string, string>>

const VERDICTS: Readonly<Record<SiretAReprendre['verdict'], string>> = {
  'a-effacer': 'à effacer',
  'a-corriger': 'à corriger',
  'a-reverifier': 'à revérifier',
  'a-renommer': 'nom repris de SIRENE',
}

const motifDe = (aReprendre: SiretAReprendre | null): string =>
  aReprendre != null && 'motif' in aReprendre ? aReprendre.motif : ''

export const confrontationConsignee = (
  lieu: LieuAReprendre,
  confrontation: Confrontation | undefined,
  aReprendre: SiretAReprendre | null,
): ConfrontationConsignee => {
  const sirene = confrontation?.sirene
  const etablissement = sirene?.etat === 'ouvert' ? sirene.etablissement : null

  return {
    lieu_id: lieu.id,
    siret: lieu.siret ?? '',
    verdict: aReprendre == null ? 'légitime' : VERDICTS[aReprendre.verdict],
    motif: motifDe(aReprendre),
    nom_du_lieu: lieu.nom,
    nom_sirene: etablissement?.nom ?? '',
    ressemblance_des_noms:
      etablissement == null
        ? ''
        : String(Math.round(ressemblanceDesNoms(lieu.nom, etablissement.nom))),
    voie_retenue_du_lieu: confrontation?.voieRetenue ?? '',
    insee_retenu_du_lieu: confrontation?.inseeRetenu ?? '',
    ban_id_retenu_du_lieu: confrontation?.adresseRetenue ?? '',
    lieu_a_la_voie: confrontation?.adresseDuLieuALaVoie ? 'oui' : 'non',
    etat_sirene: sirene?.etat ?? '',
    voie_sirene: etablissement?.voie ?? '',
    code_postal_sirene: etablissement?.codePostal ?? '',
    commune_sirene: etablissement?.commune ?? '',
    insee_sirene: etablissement?.codeInsee ?? '',
    ban_reconnue_pour_sirene: confrontation?.adresseSirene?.libelle ?? '',
    ban_id_reconnu_pour_sirene: confrontation?.adresseSirene?.banId ?? '',
    reponses_ban_pour_sirene: (confrontation?.reponsesPourSirene ?? [])
      .map(({ banId, score }) => `${banId} (${score.toFixed(2)})`)
      .join(' | '),
  }
}
