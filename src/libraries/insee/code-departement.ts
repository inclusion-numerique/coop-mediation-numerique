import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { CodeInsee } from './code-insee'

export const CodeDepartement = defineModel(
  z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^(?:\d{2}|2[AB]|9[78]\d)$/)
    .brand('CodeDepartement'),
)

export type CodeDepartement = Model.TypeOf<typeof CodeDepartement>

const estUltramarin = (codeInsee: CodeInsee): boolean =>
  /^9[78]/.test(codeInsee)

export const codeDepartementDuCodeInsee = (
  codeInsee: CodeInsee,
): CodeDepartement =>
  CodeDepartement(codeInsee.slice(0, estUltramarin(codeInsee) ? 3 : 2))
