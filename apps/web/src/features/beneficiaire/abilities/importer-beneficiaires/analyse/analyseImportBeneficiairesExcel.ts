import {
  type Commune,
  type CommunesClient,
  createCommunesClient,
} from '@app/web/communes/communesClient'
import { anneeNaissanceValidation } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { genres as genreValues } from '@app/web/features/beneficiaire/domain/genre'
import type { Genre } from '@app/web/generated/prisma/client'
import { z } from 'zod'
import { type FeuilleImport, valeurCellule } from './feuille-import'

export const ParsedBeneficiaireRowSchema = z.object({
  values: z.object({
    nom: z.string().nullish(),
    prenom: z.string().nullish(),
    anneeNaissance: z.union([z.string().nullish(), z.number().nullish()]),
    numeroTelephone: z.string().nullish(),
    communeCodeInsee: z.string().nullish(),
    communeNom: z.string().nullish(),
    communeCodePostal: z.string().nullish(),
    email: z.string().nullish(),
    genre: z.string().nullish(),
    notesSupplementaires: z.string().nullish(),
  }),
  parsed: z.object({
    commune: z
      .object({
        codePostal: z.string(),
        nom: z.string(),
        codeInsee: z.string(),
      })
      .nullable(),
    anneeNaissance: z.number().nullable(),
    genre: z.enum(genreValues).nullable(),
  }),
  errors: z
    .object({
      nom: z.string().optional(),
      prenom: z.string().optional(),
      anneeNaissance: z.string().optional(),
      communeCodeInsee: z.string().optional(),
      communeNom: z.string().optional(),
      communeCodePostal: z.string().optional(),
      numeroTelephone: z.string().optional(),
      email: z.string().optional(),
      genre: z.string().optional(),
      notesSupplementaires: z.string().optional(),
    })
    .nullish(),
})

export type ParsedBeneficiaireRow = z.infer<typeof ParsedBeneficiaireRowSchema>

export const AnalysisSchema = z.object({
  rows: z.array(ParsedBeneficiaireRowSchema),
  status: z.enum(['ok', 'error']),
})

export type Analysis = z.infer<typeof AnalysisSchema>

const parseGenre = (
  genreRaw: string | null | undefined,
): {
  value?: Genre | null
  error?: string
} => {
  if (!genreRaw) {
    return { value: 'NonCommunique' }
  }

  if (genreRaw.startsWith('F')) {
    return { value: 'Feminin' }
  }
  if (genreRaw.startsWith('M')) {
    return { value: 'Masculin' }
  }
  if (genreRaw.startsWith('N')) {
    return { value: 'NonCommunique' }
  }

  return { error: 'Genre invalide' }
}

const parseAnneeNaissance = (anneeNaissanceRaw: number | null | undefined) => {
  if (!anneeNaissanceRaw) {
    return { value: null }
  }

  const parsed = anneeNaissanceValidation.safeParse(anneeNaissanceRaw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  return { value: anneeNaissanceRaw }
}

const getCellValueAsString = (
  feuille: FeuilleImport,
  rowNumber: number,
  colNumber: number,
): string | null => {
  const valeur = valeurCellule(feuille, rowNumber, colNumber)
  return valeur !== null && valeur !== 0 ? String(valeur).trim() : null
}

const getCellValueAsNumber = (
  feuille: FeuilleImport,
  rowNumber: number,
  colNumber: number,
): number | null => {
  const valeur = valeurCellule(feuille, rowNumber, colNumber)
  if (typeof valeur === 'number') {
    return valeur
  }
  const nombre = Number(valeur)
  return valeur !== null && !Number.isNaN(nombre) ? nombre : null
}

const nombreDeColonnesImportees = 10

const rowIsEmpty = (feuille: FeuilleImport, rowNumber: number): boolean =>
  Array.from({ length: nombreDeColonnesImportees }, (_, index) =>
    getCellValueAsString(feuille, rowNumber, index + 1),
  ).every((valeur) => !valeur)

const parseBeneficiaireRow = (
  feuille: FeuilleImport,
  rowNumber: number,
  communesClient: CommunesClient,
) => {
  const nom = getCellValueAsString(feuille, rowNumber, 1)
  const prenom = getCellValueAsString(feuille, rowNumber, 2)
  const anneeNaissance = getCellValueAsNumber(feuille, rowNumber, 3)
  const communeNom = getCellValueAsString(feuille, rowNumber, 4)
  const communeCodeInsee = getCellValueAsString(feuille, rowNumber, 5)
  const communeCodePostal = getCellValueAsString(feuille, rowNumber, 6)
  const numeroTelephone = getCellValueAsString(feuille, rowNumber, 7)
  const email = getCellValueAsString(feuille, rowNumber, 8)
  const genre = getCellValueAsString(feuille, rowNumber, 9)
  const notesSupplementaires = getCellValueAsString(feuille, rowNumber, 10)

  const errors: ParsedBeneficiaireRow['errors'] = {}

  let commune: Commune | null = null

  if (!nom) {
    errors.nom = 'Le nom est obligatoire'
  }
  if (!prenom) {
    errors.prenom = 'Le prénom est obligatoire'
  }

  if (communeCodeInsee) {
    commune = communesClient.findCommuneByInsee(communeCodeInsee)
    if (commune) {
      if (commune.codePostal !== communeCodePostal) {
        errors.communeCodePostal =
          'Le code postal de la commune ne correspond pas'
      }
      if (commune.nom.toLocaleLowerCase() !== communeNom?.toLocaleLowerCase()) {
        errors.communeNom = 'Le nom de la commune ne correspond pas'
      }
    } else {
      errors.communeCodeInsee = 'Code commune non trouvé'
    }
  }

  const parsedGenre = parseGenre(genre)
  if (parsedGenre.error) {
    errors.genre = parsedGenre.error
  }

  const parsedAnneeNaissance = parseAnneeNaissance(anneeNaissance)
  if (parsedAnneeNaissance.error) {
    errors.anneeNaissance = parsedAnneeNaissance.error
  }

  const result: ParsedBeneficiaireRow = {
    values: {
      nom,
      prenom,
      anneeNaissance,
      numeroTelephone,
      communeCodeInsee,
      communeNom,
      communeCodePostal,
      email,
      genre,
      notesSupplementaires,
    },
    parsed: {
      genre: parsedGenre.value ?? null,
      commune,
      anneeNaissance: parsedAnneeNaissance.value ?? null,
    },
  }

  if (Object.entries(errors).length > 0) {
    result.errors = errors
  }
  return result
}

export const importBeneficiaireWorksheetName = 'Bénéficiaires'

const premiereLigneBeneficiaires = 4

const numerosLignesBeneficiaires = (
  feuille: FeuilleImport,
): ReadonlyArray<number> => {
  const numerosLignes = Array.from(
    { length: Math.max(feuille.length - premiereLigneBeneficiaires + 1, 0) },
    (_, index) => premiereLigneBeneficiaires + index,
  )
  const indexPremiereLigneVide = numerosLignes.findIndex((rowNumber) =>
    rowIsEmpty(feuille, rowNumber),
  )
  return indexPremiereLigneVide === -1
    ? numerosLignes
    : numerosLignes.slice(0, indexPremiereLigneVide)
}

export const analyseImportBeneficiairesExcel = async (
  feuille: FeuilleImport,
): Promise<Analysis> => {
  const communesClient = await createCommunesClient()

  const rows = numerosLignesBeneficiaires(feuille).map((rowNumber) =>
    parseBeneficiaireRow(feuille, rowNumber, communesClient),
  )

  return {
    status: rows.some((row) => row.errors) ? 'error' : 'ok',
    rows,
  }
}
