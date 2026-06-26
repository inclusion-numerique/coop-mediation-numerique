import {
  AnalysisSchema,
  type ParsedBeneficiaireRow,
} from '@app/web/features/beneficiaire/abilities/importer-beneficiaires/analyse/analyseImportBeneficiairesExcel'
import { AnneeNaissance } from '@app/web/features/beneficiaire/domain/annee-naissance'
import { CommuneResidence } from '@app/web/features/beneficiaire/domain/commune-residence'
import { ContactTelephone } from '@app/web/features/beneficiaire/domain/contact-telephone'
import { Email } from '@app/web/features/beneficiaire/domain/email'
import { Genre } from '@app/web/features/beneficiaire/domain/genre'
import { Nom } from '@app/web/features/beneficiaire/domain/nom'
import { Notes } from '@app/web/features/beneficiaire/domain/notes'
import { Prenom } from '@app/web/features/beneficiaire/domain/prenom'
import { StatutSocial } from '@app/web/features/beneficiaire/domain/statut-social'
import { Telephone } from '@app/web/features/beneficiaire/domain/telephone'
import type { z } from 'zod'
import type { BeneficiaireAImporter } from '../domain/importer-beneficiaires'

// Récupère la valeur d'un value object si elle est valide, sinon `null` : les
// champs optionnels d'un fichier importé sont tolérés (une donnée invalide est
// ignorée, pas bloquante).
const parseOptional = <S extends z.ZodTypeAny>(
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
        : AnneeNaissance(row.parsed.anneeNaissance),
    communeResidence: row.parsed.commune
      ? CommuneResidence({
          commune: row.parsed.commune.nom,
          codePostal: row.parsed.commune.codePostal,
          codeInsee: row.parsed.commune.codeInsee,
        })
      : null,
    genre: Genre(row.parsed.genre),
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
