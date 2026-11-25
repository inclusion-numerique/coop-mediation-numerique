# Fonctionnalité: Fusionner des bénéficiaires

## Règle: La fusion conserve les valeurs de la destination et complète avec la source

### Scénario: Fusionner deux bénéficiaires du médiateur

* Étant donné un bénéficiaire destination sans email
* Et un bénéficiaire source avec l'email "source@example.com"
* Quand je fusionne la source dans la destination
* Alors la fusion réussit
* Et la destination porte l'email "source@example.com"
* Et la source est marquée fusionnée vers la destination

## Règle: La fusion exige que la source et la destination existent

### Scénario: Source introuvable

* Étant donné un bénéficiaire destination sans email
* Quand je fusionne une source inexistante dans la destination
* Alors la fusion échoue avec l'erreur "BeneficiaireSourceIntrouvable"

### Scénario: Destination introuvable

* Étant donné un bénéficiaire source avec l'email "source@example.com"
* Quand je fusionne la source dans une destination inexistante
* Alors la fusion échoue avec l'erreur "BeneficiaireDestinationIntrouvable"
