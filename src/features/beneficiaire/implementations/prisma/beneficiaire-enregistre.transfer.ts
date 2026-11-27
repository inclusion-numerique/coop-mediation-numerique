import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import { Email } from '@/features/beneficiaire/domain/email'
import { Genre, type genres } from '@/features/beneficiaire/domain/genre'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
import {
  StatutSocial,
  type statutsSociaux,
} from '@/features/beneficiaire/domain/statut-social'
import {
  TrancheAge,
  type tranchesAge,
} from '@/features/beneficiaire/domain/tranche-age'
import { Telephone } from '@/libraries/telephone'

type ColonnesDecodees = {
  readonly id: string
  readonly mediateurId: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly telephone: string | null
  readonly email: string | null
  readonly anneeNaissance: number | null
  readonly notes: string | null
  readonly commune: string | null
  readonly communeCodePostal: string | null
  readonly communeCodeInsee: string | null
  readonly genre: (typeof genres)[number] | null
  readonly trancheAge: (typeof tranchesAge)[number] | null
  readonly statutSocial: (typeof statutsSociaux)[number] | null
}

const communeResidenceDe = ({
  commune,
  communeCodePostal,
  communeCodeInsee,
}: Pick<
  ColonnesDecodees,
  'commune' | 'communeCodePostal' | 'communeCodeInsee'
>): CommuneResidence | null =>
  commune === null || communeCodePostal === null || communeCodeInsee === null
    ? null
    : CommuneResidence({
        commune,
        codePostal: communeCodePostal,
        codeInsee: communeCodeInsee,
      })

const siPresent = <Brut, Decode>(
  brut: Brut | null,
  decoder: (valeur: Brut) => Decode,
): Decode | null => (brut === null ? null : decoder(brut))

export const beneficiaireEnregistreDe = <Ligne extends ColonnesDecodees>(
  {
    commune,
    communeCodePostal,
    communeCodeInsee,
    genre,
    trancheAge,
    statutSocial,
    ...ligne
  }: Ligne,
  maintenant: Date,
) => ({
  ...ligne,
  communeResidence: communeResidenceDe({
    commune,
    communeCodePostal,
    communeCodeInsee,
  }),
  genre: Genre(genre),
  trancheAge: TrancheAge(trancheAge),
  statutSocial: StatutSocial(statutSocial),
  id: BeneficiaireId(ligne.id),
  mediateurId: MediateurId(ligne.mediateurId),
  prenom: siPresent(ligne.prenom, Prenom),
  nom: siPresent(ligne.nom, Nom),
  telephone: siPresent(ligne.telephone, Telephone),
  email: siPresent(ligne.email, Email),
  anneeNaissance: siPresent(ligne.anneeNaissance, AnneeNaissance(maintenant)),
  notes: siPresent(ligne.notes, Notes.safe),
})
