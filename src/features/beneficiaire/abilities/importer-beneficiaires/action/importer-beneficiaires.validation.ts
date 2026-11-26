import type { z } from 'zod'
import {
  AnalysisSchema,
  type ParsedBeneficiaireRow,
} from '@/features/beneficiaire/abilities/importer-beneficiaires/domain/analyse-de-l-import'
import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { ContactTelephone } from '@/features/beneficiaire/domain/contact-telephone'
import { Email } from '@/features/beneficiaire/domain/email'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import { TrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { Telephone } from '@/libraries/telephone'
import type { BeneficiaireAImporter } from '../domain/importer-beneficiaires'

// Récupère la valeur d'un value object si elle est valide, sinon `null` : les
// champs optionnels d'un fichier importé sont tolérés (une donnée invalide est
// ignorée, pas bloquante).
const parseOptional = <S extends z.ZodType>(
  schema: S,
  value: unknown,
): z.output<S> | null => {
  const result = schema.safeParse(value)
  return result.success ? result.data : null
}

/**
 * Projette une ligne de fichier analysée vers un bénéficiaire à importer.
 * Le prénom et le nom sont obligatoires : une ligne dont l'un est manquant ou
 * invalide n'est pas importable (`null`). Les champs optionnels invalides
 * (e-mail, téléphone, notes) sont ignorés ; l'année, la commune et le genre ont
 * déjà été validés par l'analyse.
 */
const toBeneficiaireAImporter = (
  row: ParsedBeneficiaireRow,
): BeneficiaireAImporter | null => {
  const prenom = Prenom.schema.safeParse(row.values.prenom)
  const nom = Nom.schema.safeParse(row.values.nom)

  if (!prenom.success || !nom.success) return null

  return {
    prenom: prenom.data,
    nom: nom.data,
    contactTelephone: ContactTelephone(
      parseOptional(Telephone.schema, row.values.numeroTelephone) ?? undefined,
      undefined,
    ),
    email: parseOptional(Email.schema, row.values.email),
    anneeNaissance:
      row.parsed.anneeNaissance == null
        ? null
        : AnneeNaissance(new Date())(row.parsed.anneeNaissance),
    communeResidence: row.parsed.commune
      ? CommuneResidence({
          commune: row.parsed.commune.nom,
          codePostal: row.parsed.commune.codePostal,
          codeInsee: row.parsed.commune.codeInsee,
        })
      : null,
    genre: Genre(row.parsed.genre),
    trancheAge: TrancheAge(null),
    statutSocial: StatutSocial(null),
    notes: parseOptional(Notes.schema, row.values.notesSupplementaires),
  }
}

export const ImporterBeneficiairesValidation = AnalysisSchema.transform(
  (analysis): { beneficiaires: BeneficiaireAImporter[] } => ({
    beneficiaires: analysis.rows
      .map(toBeneficiaireAImporter)
      .filter(
        (beneficiaire): beneficiaire is BeneficiaireAImporter =>
          beneficiaire !== null,
      ),
  }),
)
