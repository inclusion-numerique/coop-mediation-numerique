import { telephoneRegex, telephoneValidation } from './telephoneValidation'

describe('telephoneRegex', () => {
  it.each([
    // Format national (10 chiffres)
    { number: '0122334455', isValid: true },
    { number: '01 22 33 44 55', isValid: true },
    { number: '01.22.33.44.55', isValid: true },
    { number: '01-22-33-44-55', isValid: true },
    { number: '06 52 18 33 21', isValid: true },
    // Format international métropole (+33)
    { number: '+33 1 22 33 44 55', isValid: true },
    { number: '+33122334455', isValid: true },
    { number: '(+33) 1 22 33 44 55', isValid: true },
    { number: '0033 1 22 33 44 55', isValid: true },
    // Format international outre-mer
    { number: '+262 692 12 34 56', isValid: true }, // Réunion
    { number: '+590 690 12 34 56', isValid: true }, // Guadeloupe
    { number: '+594 694 12 34 56', isValid: true }, // Guyane
    { number: '+596 696 12 34 56', isValid: true }, // Martinique
    // Invalides
    { number: '123-456-7890', isValid: false }, // pas de 0 initial
    { number: 'abcdefg', isValid: false },
    { number: '+33 6 52 18 33 21 88 99 99', isValid: false }, // trop long
    { number: '+49 123 456 7890', isValid: false }, // indicatif étranger
    { number: '+1 555 555 5555', isValid: false }, // indicatif étranger
    { number: '06 52 18', isValid: false }, // trop court
  ])('should validate French phone number $number as $isValid', ({
    number,
    isValid,
  }) => {
    expect(telephoneRegex.test(number)).toBe(isValid)
  })
})

describe('telephoneValidation', () => {
  it('allows null', () => {
    expect(() => telephoneValidation.parse(null)).not.toThrow()
  })
  it('allows undefined', () => {
    expect(() => telephoneValidation.parse(undefined)).not.toThrow()
  })
  it('allows empty string', () => {
    expect(() => telephoneValidation.parse(' ')).not.toThrow()
  })
  it('allows French phone number', () => {
    expect(() => telephoneValidation.parse('+33 6 12 34 56 78')).not.toThrow()
  })
  it('disallows invalid input', () => {
    expect(() => telephoneValidation.parse('abcd')).toThrow()
  })
  it('disallows foreign phone numbers', () => {
    expect(() => telephoneValidation.parse('+49 123 456 7890')).toThrow()
  })
})
