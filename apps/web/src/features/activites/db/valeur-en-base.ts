import { snakeCase } from 'change-case'

export const valeurEnBase = (valeur: string): string => snakeCase(valeur)
