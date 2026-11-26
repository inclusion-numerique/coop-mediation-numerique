import { z } from 'zod'
import {
  anneeNaissanceInvalide,
  anneeNaissanceValidation,
} from '@/features/beneficiaire/domain/annee-naissance'
import type { Genre } from '@/features/beneficiaire/domain/genre'
import { genres as genreValues } from '@/features/beneficiaire/domain/genre'
import { type FeuilleImport, valeurCellule } from './feuille-import'

type Commune = {
  readonly codeInsee: string
  readonly nom: string
  readonly codePostal: string
}

export type CommunesClient = {
  readonly findCommuneByInsee: (code: string) => Commune | null
}

const ParsedBeneficiaireRowSchema = z.object({
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

const parseAnneeNaissance = (
  anneeNaissanceRaw: number | null | undefined,
  maintenant: Date,
) => {
  if (!anneeNaissanceRaw) {
    return { value: null }
  }

  if (
    !anneeNaissanceValidation(maintenant).safeParse(anneeNaissanceRaw).success
  ) {
    return { error: anneeNaissanceInvalide }
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

const designeLaCommune = (
  saisie: string | null,
  { nom, codePostal }: Commune,
): boolean =>
  [nom, `${nom} (${codePostal})`].some(
    (libelle) => libelle.toLocaleLowerCase() === saisie?.toLocaleLowerCase(),
  )

const parseBeneficiaireRow = (
  feuille: FeuilleImport,
  rowNumber: number,
  communesClient: CommunesClient,
  maintenant: Date,
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

  const commune = communeCodeInsee
    ? communesClient.findCommuneByInsee(communeCodeInsee)
    : null

  const erreursDeCommune = !communeCodeInsee
    ? {}
    : commune
      ? {
          ...(commune.codePostal === communeCodePostal
            ? {}
            : {
                communeCodePostal:
                  'Le code postal de la commune ne correspond pas',
              }),
          ...(designeLaCommune(communeNom, commune)
            ? {}
            : { communeNom: 'Le nom de la commune ne correspond pas' }),
        }
      : { communeCodeInsee: 'Code commune non trouvé' }

  const parsedGenre = parseGenre(genre)

  const parsedAnneeNaissance = parseAnneeNaissance(anneeNaissance, maintenant)

  const errors: NonNullable<ParsedBeneficiaireRow['errors']> = {
    ...(nom ? {} : { nom: 'Le nom est obligatoire' }),
    ...(prenom ? {} : { prenom: 'Le prénom est obligatoire' }),
    ...erreursDeCommune,
    ...(parsedGenre.error ? { genre: parsedGenre.error } : {}),
    ...(parsedAnneeNaissance.error
      ? { anneeNaissance: parsedAnneeNaissance.error }
      : {}),
  }

  return {
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
    ...(Object.keys(errors).length > 0 ? { errors } : {}),
  }
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

export const analyserLaFeuille =
  (communesClient: CommunesClient) =>
  ({
    feuille,
    maintenant,
  }: {
    readonly feuille: FeuilleImport
    readonly maintenant: Date
  }): Analysis => {
    const rows = numerosLignesBeneficiaires(feuille).map((rowNumber) =>
      parseBeneficiaireRow(feuille, rowNumber, communesClient, maintenant),
    )

    return {
      status: rows.some((row) => row.errors) ? 'error' : 'ok',
      rows,
    }
  }

export type AnalyseResponse = {
  analysis: Analysis
  id: string
}
