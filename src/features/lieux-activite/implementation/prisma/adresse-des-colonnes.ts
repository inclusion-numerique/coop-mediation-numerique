import { Adresse } from '@gouvfr-anct/lieux-de-mediation-numerique'

export const adresseDesColonnes = ({
  adresse,
  commune,
  codePostal,
  codeInsee = null,
  complementAdresse = null,
}: {
  readonly adresse: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee?: string | null
  readonly complementAdresse?: string | null
}): Adresse | null =>
  Adresse.safe({
    voie: adresse,
    commune,
    code_postal: codePostal,
    ...(codeInsee == null || codeInsee.trim() === ''
      ? {}
      : { code_insee: codeInsee }),
    ...(complementAdresse == null || complementAdresse.trim() === ''
      ? {}
      : { complement_adresse: complementAdresse }),
  })
