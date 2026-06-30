# Feature: Fusionner des bénéficiaires

## Rule: La fusion conserve les valeurs de la destination et complète avec la source

### Scenario: Fusionner deux bénéficiaires du médiateur

* Given un bénéficiaire destination sans email
* And un bénéficiaire source avec l'email "source@example.com"
* When je fusionne la source dans la destination
* Then la fusion réussit
* And la destination porte l'email "source@example.com"
* And la source est marquée fusionnée vers la destination

## Rule: La fusion exige que la source et la destination existent

### Scenario: Source introuvable

* Given un bénéficiaire destination sans email
* When je fusionne une source inexistante dans la destination
* Then la fusion échoue avec l'erreur "BeneficiaireSourceIntrouvable"

### Scenario: Destination introuvable

* Given un bénéficiaire source avec l'email "source@example.com"
* When je fusionne la source dans une destination inexistante
* Then la fusion échoue avec l'erreur "BeneficiaireDestinationIntrouvable"
