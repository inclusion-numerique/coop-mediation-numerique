import type { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'
import type { EmployeuseLue } from '.'

const adresseRetenue = (
  { adresse }: EmployeuseLue,
  adresseBan?: AdresseBanData,
) =>
  adresseBan == null
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

export const lieuDepuisEmployeuse = (
  employeuse: EmployeuseLue,
  adresseBan?: AdresseBanData,
) => ({
  nom: employeuse.denomination ?? '',
  ...adresseRetenue(employeuse, adresseBan),
  complementAdresse: null,
  siret: employeuse.siret,
  synchronisationSiret: employeuse.siret === null ? null : new Date(),
  rna: employeuse.rna,
  ...referent(employeuse),
})
