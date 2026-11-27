import {
  lieuCoopToDomain,
  lieuFromDomain,
} from '../../../../implementations/prisma/lieu.transfer'
import type { LigneDuLieuCoop } from '../../../../implementations/prisma/ligne-du-lieu.select'
import type { FicheFusionnable } from '../../domain'

type Heritage = {
  readonly nomReferent: string | null
  readonly courrielReferent: string | null
  readonly telephoneReferent: string | null
  readonly v1Imported: Date | null
  readonly v1StructureId: string | null
  readonly v1StructureIdPg: number | null
  readonly v1PermanenceId: string | null
}

export const ficheFusionnableToDomain = (
  ligne: LigneDuLieuCoop & Heritage,
): FicheFusionnable => ({
  lieu: lieuCoopToDomain(ligne),
  heritage: {
    nomReferent: ligne.nomReferent,
    courrielReferent: ligne.courrielReferent,
    telephoneReferent: ligne.telephoneReferent,
    v1Imported: ligne.v1Imported,
    v1StructureId: ligne.v1StructureId,
    v1StructureIdPg: ligne.v1StructureIdPg,
    v1PermanenceId: ligne.v1PermanenceId,
  },
})

export const colonnesDeLaFicheFusionnee = ({
  lieu,
  heritage,
}: FicheFusionnable) => {
  const colonnes = lieuFromDomain(lieu)

  return {
    typologies: colonnes.typologies,
    services: colonnes.services,
    publicsSpecifiquementAdresses: colonnes.publicsSpecifiquementAdresses,
    priseEnChargeSpecifique: colonnes.priseEnChargeSpecifique,
    fraisACharge: colonnes.fraisACharge,
    dispositifProgrammesNationaux: colonnes.dispositifProgrammesNationaux,
    formationsLabels: colonnes.formationsLabels,
    autresFormationsLabels: colonnes.autresFormationsLabels,
    itinerance: colonnes.itinerance,
    modalitesAcces: colonnes.modalitesAcces,
    modalitesAccompagnement: colonnes.modalitesAccompagnement,
    courriels: colonnes.courriels,
    visiblePourCartographieNationale: colonnes.visiblePourCartographieNationale,
    ...heritage,
  }
}
