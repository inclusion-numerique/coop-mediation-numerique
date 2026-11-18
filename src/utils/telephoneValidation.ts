import z from 'zod'

// Indicatifs français : métropole (33) + outre-mer (262, 590, 594, 596)
// Format national : 10 chiffres commençant par 0
// Format international : indicatif + 9 chiffres
export const telephoneRegex =
  /^(?:(?:\(\+(?:33|262|590|594|596)\)|\+(?:33|262|590|594|596)|00(?:33|262|590|594|596))[\s()./-]*(?:\d[\s()./-]*){8}\d|0\d(?:[\s./-]?\d){8})$/

export const telephoneValidation = z
  .string()
  .transform((value) => (value.trim() === '' ? null : value))
  .refine((data) => data === null || telephoneRegex.test(data), {
    message:
      'Veuillez renseigner un numéro français (e.g. 04 55 66 77 88 ou +33 4 55 66 77 88)',
  })
  .nullish()
