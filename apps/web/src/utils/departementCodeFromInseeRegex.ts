import { Prisma } from '@prisma/client'

/**
 * Regex pattern for extracting department code from INSEE code
 * - 97x or 98x → DOM-TOM (3 digits)
 * - 2A / 2B → Corsica
 * - 00-95 → Metropolitan France
 */
export const departementCodeFromInseeRegex = Prisma.raw(
  "'^(97[0-9]|98[0-9]|[0-9]{2}|2[AB])'",
)
