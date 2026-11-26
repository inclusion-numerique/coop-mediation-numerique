import type { AdresseBanData } from '@/libraries/adresse'
import type { EmployeuseLue, LieuDecrit } from './ports'

const adresseRetenue = (
  { adresse }: EmployeuseLue,
  adresseBan: AdresseBanData | null,
) =>
  adresseBan === null
    ? {
        adresse: adresse?.voie ?? '',
        commune: adresse?.commune ?? '',
        codePostal: adresse?.codePostal ?? '',
        codeInsee: adresse?.codeInsee ?? null,
      }
    : {
        adresse: adresseBan.nom,
        commune: adresseBan.commune,
        codePostal: adresseBan.codePostal,
        codeInsee: adresseBan.codeInsee,
        banId: adresseBan.id,
        latitude: adresseBan.latitude,
        longitude: adresseBan.longitude,
      }

const referent = ({ contactReferent }: EmployeuseLue) =>
  contactReferent._tag === 'renseigne'
    ? {
        nomReferent: contactReferent.nom,
        courrielReferent: contactReferent.courriel,
        telephoneReferent: contactReferent.telephone,
      }
    : { nomReferent: null, courrielReferent: null, telephoneReferent: null }

export const lieuDepuisEmployeuse = ({
  employeuse,
  adresseBan,
  maintenant,
}: {
  readonly employeuse: EmployeuseLue
  readonly adresseBan: AdresseBanData | null
  readonly maintenant: Date
}): LieuDecrit => ({
  nom: employeuse.denomination ?? '',
  ...adresseRetenue(employeuse, adresseBan),
  complementAdresse: null,
  siret: employeuse.siret,
  synchronisationSiret: employeuse.siret === null ? null : maintenant,
  rna: employeuse.rna,
  ...referent(employeuse),
})
