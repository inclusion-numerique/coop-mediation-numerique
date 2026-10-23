import { CodeInsee } from '@app/web/libraries/departement'

export const communesLues = (
  valeur: string | undefined,
): readonly CodeInsee[] =>
  (valeur ?? '').split(',').flatMap((code) => {
    const commune = CodeInsee.safe(code)
    return commune === null ? [] : [commune]
  })
