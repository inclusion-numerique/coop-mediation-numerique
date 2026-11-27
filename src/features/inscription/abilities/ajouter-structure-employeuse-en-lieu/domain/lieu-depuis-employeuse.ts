import type {
  AdresseDeclareeDuLieu,
  AdresseGeocodee,
  AdresseGeocodeeDuLieu,
  EmployeuseLue,
  LieuDecrit,
  LieuDecritGeocode,
} from './ports'

const referent = ({ contactReferent }: EmployeuseLue) =>
  contactReferent._tag === 'renseigne'
    ? {
        nomReferent: contactReferent.nom,
        courrielReferent: contactReferent.courriel,
        telephoneReferent: contactReferent.telephone,
      }
    : { nomReferent: null, courrielReferent: null, telephoneReferent: null }

const lieuALAdresse = <Adresse>(
  employeuse: EmployeuseLue,
  nom: string,
  adresse: Adresse,
  maintenant: Date,
) => ({
  nom,
  adresse,
  siret: employeuse.siret,
  synchronisationSiret: employeuse.siret === null ? null : maintenant,
  rna: employeuse.rna,
  ...referent(employeuse),
})

export const lieuGeocode = ({
  employeuse,
  nom,
  adresseBan,
  maintenant,
}: {
  readonly employeuse: EmployeuseLue
  readonly nom: string
  readonly adresseBan: AdresseGeocodee
  readonly maintenant: Date
}): LieuDecritGeocode =>
  lieuALAdresse<AdresseGeocodeeDuLieu>(
    employeuse,
    nom,
    {
      _tag: 'AdresseGeocodee',
      voie: adresseBan.nom,
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
  employeuse.adresse === null || employeuse.denomination === null
    ? null
    : lieuALAdresse<AdresseDeclareeDuLieu>(
        employeuse,
        employeuse.denomination,
        {
          _tag: 'AdresseDeclaree',
          voie: employeuse.adresse.voie,
          commune: employeuse.adresse.commune,
          codePostal: employeuse.adresse.codePostal,
          codeInsee: employeuse.adresse.codeInsee,
        },
        maintenant,
      )
