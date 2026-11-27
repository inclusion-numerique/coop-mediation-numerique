import type { AdresseGeocodee, EmployeuseLue, LieuDecrit } from './ports'

type AdresseDuLieu = Pick<
  LieuDecrit,
  'adresse' | 'commune' | 'codePostal' | 'codeInsee'
> &
  Partial<Pick<LieuDecrit, 'banId' | 'latitude' | 'longitude'>>

const referent = ({ contactReferent }: EmployeuseLue) =>
  contactReferent._tag === 'renseigne'
    ? {
        nomReferent: contactReferent.nom,
        courrielReferent: contactReferent.courriel,
        telephoneReferent: contactReferent.telephone,
      }
    : { nomReferent: null, courrielReferent: null, telephoneReferent: null }

const lieuALAdresse = (
  employeuse: EmployeuseLue,
  adresse: AdresseDuLieu,
  maintenant: Date,
): LieuDecrit => ({
  nom: employeuse.denomination ?? '',
  ...adresse,
  complementAdresse: null,
  siret: employeuse.siret,
  synchronisationSiret: employeuse.siret === null ? null : maintenant,
  rna: employeuse.rna,
  ...referent(employeuse),
})

export const lieuGeocode = ({
  employeuse,
  adresseBan,
  maintenant,
}: {
  readonly employeuse: EmployeuseLue
  readonly adresseBan: AdresseGeocodee
  readonly maintenant: Date
}): LieuDecrit =>
  lieuALAdresse(
    employeuse,
    {
      adresse: adresseBan.nom,
      commune: adresseBan.commune,
      codePostal: adresseBan.codePostal,
      codeInsee: adresseBan.codeInsee,
      banId: adresseBan.id,
      latitude: adresseBan.latitude,
      longitude: adresseBan.longitude,
    },
    maintenant,
  )

export const lieuALAdresseConnue = ({
  employeuse,
  maintenant,
}: {
  readonly employeuse: EmployeuseLue
  readonly maintenant: Date
}): LieuDecrit | null =>
  employeuse.adresse === null
    ? null
    : lieuALAdresse(
        employeuse,
        {
          adresse: employeuse.adresse.voie ?? '',
          commune: employeuse.adresse.commune,
          codePostal: employeuse.adresse.codePostal,
          codeInsee: employeuse.adresse.codeInsee,
        },
        maintenant,
      )
