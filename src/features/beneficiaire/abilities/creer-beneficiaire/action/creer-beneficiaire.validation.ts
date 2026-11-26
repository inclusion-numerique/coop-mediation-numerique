import { beneficiaireFormShape } from '@/features/beneficiaire/action/champs-du-beneficiaire.validation'
import { ContactTelephone } from '@/features/beneficiaire/domain/contact-telephone'
import { Genre } from '@/features/beneficiaire/domain/genre'
import { StatutSocial } from '@/features/beneficiaire/domain/statut-social'
import type { BeneficiaireACreer } from '../domain/beneficiaire-a-creer'

export const CreerBeneficiaireValidation = beneficiaireFormShape.transform(
  (form): BeneficiaireACreer => ({
    prenom: form.prenom,
    nom: form.nom,
    contactTelephone: ContactTelephone(form.telephone, form.pasDeTelephone),
    email: form.email ?? null,
    anneeNaissance: form.anneeNaissance ?? null,
    communeResidence: form.communeResidence ?? null,
    genre: Genre(form.genre),
    trancheAge: form.trancheAge,
    statutSocial: StatutSocial(form.statutSocial),
    notes: form.notes ?? null,
  }),
)
