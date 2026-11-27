import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { AdresseValidee, LieuDemande } from '../domain'

type IdentiteDuLieu = {
  readonly nom: string
  readonly siret: string | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}

export type LieuDesire =
  | (IdentiteDuLieu & { readonly _tag: 'LieuConnu'; readonly id: LieuId })
  | (IdentiteDuLieu & {
      readonly _tag: 'LieuNouveau'
      readonly adresse: AdresseValidee
    })

export const lieuDemande = ({
  nom,
  siret,
  structureCartographieNationaleId,
  ...lieu
}: LieuDesire): LieuDemande => {
  const identite = { nom: Nom(nom), siret, structureCartographieNationaleId }

  return lieu._tag === 'LieuConnu'
    ? { ...identite, id: lieu.id }
    : { ...identite, ...lieu.adresse }
}
