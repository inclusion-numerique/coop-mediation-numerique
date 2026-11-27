import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuId } from '@/features/inscription/domain'
import { Siret } from '@/libraries/insee'
import { IdentifiantCartographie, type LieuSoumis } from '../domain'
import type { RenseignerLieuxActiviteData } from './renseigner-lieux-activite.validation'

export type SaisieDuLieu = RenseignerLieuxActiviteData['lieux'][number]

const identiteSaisie = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: SaisieDuLieu) => ({
  nom: Nom(nom),
  siret: siret == null ? null : Siret.safe(siret),
  structureCartographieNationaleId:
    structureCartographieNationaleId == null
      ? null
      : IdentifiantCartographie.safe(structureCartographieNationaleId),
})

export const lieuxSoumis =
  <Adresse extends object>(
    adresseValidee: (saisie: SaisieDuLieu) => Adresse | null,
  ) =>
  (saisies: readonly SaisieDuLieu[]): readonly LieuSoumis<Adresse>[] =>
    saisies.map((saisie) =>
      saisie.id == null
        ? {
            _tag: 'LieuACreer',
            ...identiteSaisie(saisie),
            adresseValidee: adresseValidee(saisie),
          }
        : {
            _tag: 'LieuExistant',
            ...identiteSaisie(saisie),
            id: LieuId(saisie.id),
          },
    )
