# Feature: Créer ou fusionner un bénéficiaire depuis un usager externe

## Rule: Chaque usager d'un système externe donne un bénéficiaire (créé ou fusionné), sans jamais bloquer le lot

### Scenario: Créer un bénéficiaire depuis un usager sans correspondance

* Given un usager externe sans bénéficiaire correspondant
* When je crée ou fusionne les bénéficiaires depuis ces usagers
* Then un bénéficiaire est créé et lié à cet usager

### Scenario: Fusionner dans un bénéficiaire existant en doublon

* Given un usager externe correspondant à un bénéficiaire existant
* When je crée ou fusionne les bénéficiaires depuis ces usagers
* Then aucun nouveau bénéficiaire n’est créé et l’existant est lié à l’usager

### Scenario: Un candidat au téléphone legacy invalide ne bloque pas la fusion

* Given un usager externe correspondant à un bénéficiaire au téléphone legacy invalide
* When je crée ou fusionne les bénéficiaires depuis ces usagers
* Then l’usager est fusionné sans erreur dans le bénéficiaire existant

### Scenario: Un usager en échec est écarté sans bloquer les autres

* Given deux usagers externes dont un provoque une erreur d’infrastructure
* When je crée ou fusionne les bénéficiaires depuis ces usagers
* Then l’usager valide est fusionné et l’usager en échec est écarté
