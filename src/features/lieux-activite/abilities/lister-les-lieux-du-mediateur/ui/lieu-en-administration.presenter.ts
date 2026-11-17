import { dateAsDay } from '@app/web/utils/dateAsDay'
import type { LieuDuMediateurEnListe } from '../domain'

export type LieuEnAdministration = {
  readonly rattachement: string
  readonly id: string
  readonly nom: string
  readonly adresse: string
  readonly commune: string
  readonly codeInsee: string
  readonly codePostal: string
  readonly rattacheLe: string
}

export const lieuEnAdministration = ({
  id,
  debut,
  lieuInclusion: { id: lieuId, nom, adresse },
}: LieuDuMediateurEnListe): LieuEnAdministration => ({
  rattachement: id,
  id: lieuId,
  nom,
  adresse: adresse?.voie ?? 'Non renseignée',
  commune: adresse?.commune ?? 'Non renseignée',
  codeInsee: adresse?.code_insee ?? 'Non renseigné',
  codePostal: adresse?.code_postal ?? 'Non renseigné',
  rattacheLe: dateAsDay(debut),
})
