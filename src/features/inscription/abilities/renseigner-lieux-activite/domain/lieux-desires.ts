import { failure, type Result, success } from '@/libraries/result'
import { AdresseNonValidee } from './adresse-non-validee'
import type { AdresseValidee, LieuActiviteInput } from './reconcilier'

export type LieuSoumis = {
  readonly id?: string | null | undefined
  readonly structureCartographieNationaleId?: string | null | undefined
  readonly nom: string
  readonly siret?: string | null | undefined
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null | undefined
  readonly banId?: string | null | undefined
  readonly latitude?: number | null | undefined
  readonly longitude?: number | null | undefined
}

const identite = ({
  nom,
  siret,
  structureCartographieNationaleId,
}: LieuSoumis) => ({
  nom,
  ...(siret === undefined ? {} : { siret }),
  ...(structureCartographieNationaleId === undefined
    ? {}
    : { structureCartographieNationaleId }),
})

const adresseValidee = (lieu: LieuSoumis): AdresseValidee | null =>
  lieu.codeInsee == null ||
  lieu.banId == null ||
  lieu.latitude == null ||
  lieu.longitude == null
    ? null
    : {
        adresse: lieu.adresse,
        commune: lieu.commune,
        codePostal: lieu.codePostal,
        codeInsee: lieu.codeInsee,
        banId: lieu.banId,
        latitude: lieu.latitude,
        longitude: lieu.longitude,
      }

export const lieuxDesires = (
  lieux: readonly LieuSoumis[],
): Result<readonly LieuActiviteInput[], AdresseNonValidee> =>
  lieux.reduce<Result<readonly LieuActiviteInput[], AdresseNonValidee>>(
    (precedents, lieu) => {
      if (!precedents.success) return precedents

      if (lieu.id != null)
        return success([
          ...precedents.data,
          {
            ...identite(lieu),
            id: lieu.id,
            adresse: lieu.adresse,
            commune: lieu.commune,
            codePostal: lieu.codePostal,
            ...(lieu.codeInsee === undefined
              ? {}
              : { codeInsee: lieu.codeInsee }),
          },
        ])

      const validee = adresseValidee(lieu)

      return validee == null
        ? failure(AdresseNonValidee(lieu.nom))
        : success([...precedents.data, { ...identite(lieu), ...validee }])
    },
    success([]),
  )
