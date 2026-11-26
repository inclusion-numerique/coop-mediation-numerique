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

## Règle: Un médiateur ne fusionne jamais le bénéficiaire d'un autre médiateur

### Scénario: Fusionner le bénéficiaire d'un autre médiateur échoue

* Étant donné un bénéficiaire destination sans email
* Et un bénéficiaire enregistré pour un autre médiateur
* Quand je fusionne le bénéficiaire de l'autre médiateur dans la destination
* Alors la fusion échoue avec l'erreur "BeneficiaireSourceIntrouvable"
* Et le bénéficiaire de l'autre médiateur garde son identité

### Scénario: L'écriture de la fusion n'atteint pas le bénéficiaire d'un autre médiateur

* Étant donné un bénéficiaire destination sans email
* Et un bénéficiaire enregistré pour un autre médiateur
* Quand l'écriture de la fusion verse le bénéficiaire de l'autre médiateur dans la destination
* Alors l'écriture de la fusion est refusée
* Et le bénéficiaire de l'autre médiateur garde son identité
