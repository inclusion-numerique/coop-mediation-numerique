import { AnneeNaissance } from '@/features/beneficiaire/domain/annee-naissance'
import { Email } from '@/features/beneficiaire/domain/email'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { NOM_MAX_LENGTH, Nom } from '@/features/beneficiaire/domain/nom'
import {
  PRENOM_MAX_LENGTH,
  Prenom,
} from '@/features/beneficiaire/domain/prenom'
import { effectiveTrancheAge } from '@/features/beneficiaire/domain/tranche-age'
import { failure, type Result, success } from '@/libraries/result'
import { Telephone } from '@/libraries/telephone'
import {
  type EchecDeCreerOuFusionnerDepuisUsagerExterne,
  type EchecTechnique,
  IdentiteIncomplete,
  type MotifDEcart,
} from './errors'
import type { EcritureDUnUsager, FusionDesUsagers } from './fusion-des-usagers'
import type { CreerOuFusionnerDepuisUsagerExternePorts } from './ports'
import type {
  CommuneFields,
  DonneesDeFusion,
  MergedBeneficiaire,
  UsagerExterneAFusionner,
  UsagerNormalise,
} from './usager-externe'

const ANNEE_DE_NAISSANCE_ABSENTE_DE_RDVSP = 1900

type IdentiteConnue = {
  readonly email: string | null
  readonly telephone: string | null
  readonly prenom: string | null
  readonly nom: string | null
  readonly anneeNaissance: number | null
}

const tronque = (valeur: string, longueurMax: number): string =>
  valeur.trim().slice(0, longueurMax)

const anneeDeNaissance = (
  birthDate: Date | null,
  maintenant: Date,
): AnneeNaissance | null => {
  const annee = birthDate?.getFullYear()
  return annee && annee > ANNEE_DE_NAISSANCE_ABSENTE_DE_RDVSP
    ? AnneeNaissance(maintenant).safe(annee)
    : null
}

const normaliser = (
  usager: UsagerExterneAFusionner,
  maintenant: Date,
): UsagerNormalise => ({
  rdvUserId: usager.rdvUserId,
  nom: usager.nom ? Nom.safe(tronque(usager.nom, NOM_MAX_LENGTH)) : null,
  prenom: usager.prenom
    ? Prenom.safe(tronque(usager.prenom, PRENOM_MAX_LENGTH))
    : null,
  telephone: usager.telephone ? Telephone.safe(usager.telephone) : null,
  email: usager.email ? Email.safe(usager.email) : null,
  adresse: usager.adresse,
  anneeNaissance: anneeDeNaissance(usager.birthDate, maintenant),
})

const donneesDeFusion = ({
  usager,
  existant,
  dejaLie,
  residenceConnue,
  commune,
  maintenant,
}: {
  readonly usager: UsagerNormalise
  readonly existant: IdentiteConnue
  readonly dejaLie: boolean
  readonly residenceConnue: boolean
  readonly commune: CommuneFields | null
  readonly maintenant: Date
}): DonneesDeFusion => ({
  ...(dejaLie ? {} : { rdvUserId: usager.rdvUserId }),
  ...(usager.email && !existant.email ? { email: usager.email } : {}),
  ...(usager.telephone && !existant.telephone
    ? { telephone: usager.telephone }
    : {}),
  ...(usager.prenom && !existant.prenom ? { prenom: usager.prenom } : {}),
  ...(usager.nom && !existant.nom ? { nom: usager.nom } : {}),
  ...(usager.adresse && !residenceConnue ? { adresse: usager.adresse } : {}),
  ...(usager.anneeNaissance && !existant.anneeNaissance
    ? {
        anneeNaissance: usager.anneeNaissance,
        trancheAge: effectiveTrancheAge(
          usager.anneeNaissance,
          null,
          maintenant,
        ),
      }
    : {}),
  ...(commune
    ? {
        commune: commune.commune,
        communeCodePostal: commune.communeCodePostal,
        communeCodeInsee: commune.communeCodeInsee,
      }
    : {}),
})

type IssueDUnUsager = {
  readonly beneficiaire: MergedBeneficiaire
  readonly ecriture: EcritureDUnUsager | null
}

const ecrit =
  (ecriture: EcritureDUnUsager) =>
  (
    resultat: Result<MergedBeneficiaire, EchecTechnique>,
  ): Result<IssueDUnUsager, EchecTechnique> =>
    resultat.success
      ? success({ beneficiaire: resultat.data, ecriture })
      : resultat

const traiterUnUsager =
  (
    {
      lireLeBeneficiaireLie,
      trouverUnDoublon,
      communeDeLAdresse,
      mettreAJourLeBeneficiaire,
      creerLeBeneficiaire,
    }: CreerOuFusionnerDepuisUsagerExternePorts,
    mediateurId: MediateurId,
    maintenant: Date,
  ) =>
  async (
    usagerExterne: UsagerExterneAFusionner,
  ): Promise<Result<IssueDUnUsager, MotifDEcart>> => {
    const usager = normaliser(usagerExterne, maintenant)

    const communeSiInconnue = (
      communeConnue: boolean,
    ): Promise<Result<CommuneFields | null, EchecTechnique>> =>
      usager.adresse && !communeConnue
        ? communeDeLAdresse(usager.adresse)
        : Promise.resolve(success(null))

    const lie = await lireLeBeneficiaireLie({
      rdvUserId: usager.rdvUserId,
      mediateurId,
    })
    if (!lie.success) return lie

    if (lie.data !== null) {
      const beneficiaireLie = lie.data
      const commune = await communeSiInconnue(Boolean(beneficiaireLie.commune))
      if (!commune.success) return commune
      const donnees = donneesDeFusion({
        usager,
        existant: beneficiaireLie,
        dejaLie: true,
        residenceConnue: false,
        commune: commune.data,
        maintenant,
      })
      const miseAJour = { id: beneficiaireLie.id, donnees }
      return Object.keys(donnees).length > 0
        ? ecrit({ _tag: 'MiseAJour', ...miseAJour })(
            await mettreAJourLeBeneficiaire(miseAJour),
          )
        : success({ beneficiaire: beneficiaireLie, ecriture: null })
    }

    const doublon = await trouverUnDoublon({
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      mediateurId,
    })
    if (!doublon.success) return doublon

    if (doublon.data !== null) {
      const { id, communeResidence } = doublon.data
      const commune = await communeSiInconnue(communeResidence !== null)
      if (!commune.success) return commune
      const miseAJour = {
        id,
        donnees: donneesDeFusion({
          usager,
          existant: doublon.data,
          dejaLie: false,
          residenceConnue: communeResidence !== null,
          commune: commune.data,
          maintenant,
        }),
      }
      return ecrit({ _tag: 'MiseAJour', ...miseAJour })(
        await mettreAJourLeBeneficiaire(miseAJour),
      )
    }

    if (usager.nom === null || usager.prenom === null)
      return failure(IdentiteIncomplete(usager.rdvUserId))

    const commune = await communeSiInconnue(false)
    if (!commune.success) return commune

    const beneficiaire = {
      rdvUserId: usager.rdvUserId,
      nom: usager.nom,
      prenom: usager.prenom,
      telephone: usager.telephone,
      email: usager.email,
      adresse: usager.adresse,
      anneeNaissance: usager.anneeNaissance,
      trancheAge: effectiveTrancheAge(usager.anneeNaissance, null, maintenant),
      commune: commune.data?.commune ?? null,
      communeCodePostal: commune.data?.communeCodePostal ?? null,
      communeCodeInsee: commune.data?.communeCodeInsee ?? null,
      mediateurId,
    }
    return ecrit({ _tag: 'Creation', beneficiaire })(
      await creerLeBeneficiaire(beneficiaire),
    )
  }

export const creerOuFusionnerDepuisUsagerExterne =
  ({
    lireLeBeneficiaireLie,
    trouverUnDoublon,
    communeDeLAdresse,
    mettreAJourLeBeneficiaire,
    creerLeBeneficiaire,
  }: CreerOuFusionnerDepuisUsagerExternePorts) =>
  async ({
    usagers,
    mediateurId,
    maintenant,
  }: {
    readonly usagers: readonly UsagerExterneAFusionner[]
    readonly mediateurId: MediateurId
    readonly maintenant: Date
  }): Promise<
    Result<FusionDesUsagers, EchecDeCreerOuFusionnerDepuisUsagerExterne>
  > => {
    const traiter = traiterUnUsager(
      {
        lireLeBeneficiaireLie,
        trouverUnDoublon,
        communeDeLAdresse,
        mettreAJourLeBeneficiaire,
        creerLeBeneficiaire,
      },
      mediateurId,
      maintenant,
    )
    const issues = await Promise.all(
      usagers.map(async (usager) => ({
        rdvUserId: usager.rdvUserId,
        issue: await traiter(usager),
      })),
    )

    return success({
      merges: issues.flatMap(({ issue }) =>
        issue.success ? [issue.data.beneficiaire] : [],
      ),
      skipped: issues.flatMap(({ rdvUserId, issue }) =>
        issue.success ? [] : [{ rdvUserId, reason: issue.error }],
      ),
      ecritures: issues.flatMap(({ issue }) =>
        issue.success && issue.data.ecriture !== null
          ? [issue.data.ecriture]
          : [],
      ),
    })
  }
