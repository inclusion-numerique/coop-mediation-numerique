import { z } from 'zod'
import { defineModel } from './index'

const Trigram = defineModel(z.string().trim().length(3).brand('Trigram'))
const Upper = defineModel(z.string().min(1).brand('Upper'), (input: string) =>
  input.toUpperCase(),
)

describe('defineModel', () => {
  describe('partial form (throwing constructor)', () => {
    it('builds a branded value on valid input', () => {
      expect(Trigram('abc')).toBe('abc')
    })

    it('throws on invalid input', () => {
      expect(() => Trigram('toolong')).toThrow()
    })

    it('applies the transform before validating', () => {
      expect(Upper('abc')).toBe('ABC')
    })
  })

  describe('total form (.safe)', () => {
    it('returns the branded value on valid input', () => {
      expect(Trigram.safe('abc')).toBe('abc')
    })

    it('returns null on invalid input instead of throwing', () => {
      expect(Trigram.safe('toolong')).toBeNull()
    })

    it('never throws, even on structurally wrong input', () => {
      expect(() => Trigram.safe(undefined as unknown as string)).not.toThrow()
      expect(Trigram.safe(undefined as unknown as string)).toBeNull()
    })

    it('applies the transform before validating', () => {
      expect(Upper.safe('abc')).toBe('ABC')
    })
  })
})
