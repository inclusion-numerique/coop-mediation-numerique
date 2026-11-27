import { LieuId } from '@/features/inscription/domain'
import { IdentifiantCartographie, type LieuSoumis } from '../domain'
import type { RenseignerLieuxActiviteData } from './renseigner-lieux-activite.validation'

export type SaisieDuLieu = RenseignerLieuxActiviteData['lieux'][number]

const identiteSaisie = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: SaisieDuLieu) => ({
  nom,
  siret: siret ?? null,
  structureCartographieNationaleId:
    structureCartographieNationaleId == null
      ? null
      : IdentifiantCartographie.safe(structureCartographieNationaleId),
})

export const lieuxSoumis =
  <Adresse>(adresseValidee: (saisie: SaisieDuLieu) => Adresse | null) =>
  (saisies: readonly SaisieDuLieu[]): readonly LieuSoumis<Adresse>[] =>
    saisies.map((saisie) =>
      saisie.id == null
        ? {
            _tag: 'LieuNouveau',
            ...identiteSaisie(saisie),
            adresse: adresseValidee(saisie),
          }
        : {
            _tag: 'LieuConnu',
            ...identiteSaisie(saisie),
            id: LieuId(saisie.id),
          },
    )
