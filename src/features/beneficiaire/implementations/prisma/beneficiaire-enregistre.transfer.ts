import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { Email } from '@/features/beneficiaire/domain/email'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { Nom } from '@/features/beneficiaire/domain/nom'
import { Notes } from '@/features/beneficiaire/domain/notes'
import { Prenom } from '@/features/beneficiaire/domain/prenom'
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
}

const siPresent = <Brut, Decode>(
  brut: Brut | null,
  decoder: (valeur: Brut) => Decode,
): Decode | null => (brut === null ? null : decoder(brut))

export const beneficiaireEnregistreDe = <Ligne extends ColonnesDecodees>(
  ligne: Ligne,
  maintenant: Date,
) => ({
  ...ligne,
  id: BeneficiaireId(ligne.id),
  mediateurId: MediateurId(ligne.mediateurId),
  prenom: siPresent(ligne.prenom, Prenom),
  nom: siPresent(ligne.nom, Nom),
  telephone: siPresent(ligne.telephone, Telephone),
  email: siPresent(ligne.email, Email),
  anneeNaissance: siPresent(ligne.anneeNaissance, AnneeNaissance(maintenant)),
  notes: siPresent(ligne.notes, Notes.safe),
})
