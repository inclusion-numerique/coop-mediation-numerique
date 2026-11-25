# Fonctionnalité: Créer ou fusionner un bénéficiaire depuis un usager externe

## Règle: Chaque usager d'un système externe donne un bénéficiaire (créé ou fusionné), sans jamais bloquer le lot

### Scénario: Créer un bénéficiaire depuis un usager sans correspondance

* Étant donné un usager externe sans bénéficiaire correspondant
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors un bénéficiaire est créé et lié à cet usager

### Scénario: Fusionner dans un bénéficiaire existant en doublon

* Étant donné un usager externe correspondant à un bénéficiaire existant
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors aucun nouveau bénéficiaire n’est créé et l’existant est lié à l’usager

### Scénario: Un candidat au téléphone legacy invalide ne bloque pas la fusion

* Étant donné un usager externe correspondant à un bénéficiaire au téléphone legacy invalide
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors l’usager est fusionné sans erreur dans le bénéficiaire existant

### Scénario: Un usager en échec est écarté sans bloquer les autres

* Étant donné deux usagers externes dont un provoque une erreur d’infrastructure
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors l’usager valide est fusionné et l’usager en échec est écarté

## Règle: Ce que le port écrit doit rester lisible par le modèle du bénéficiaire

### Scénario: Un nom trop long est tronqué plutôt que perdu

* Étant donné un usager externe au nom plus long que la limite du bénéficiaire
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors le bénéficiaire est créé avec un nom tronqué à la limite

### Scénario: Un usager sans identité exploitable est écarté

* Étant donné un usager externe dont le nom et le prénom sont vides
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors aucun bénéficiaire n’est créé et l’usager est écarté

### Scénario: Une année de naissance hors bornes n’entre pas en base

* Étant donné un usager externe né dans le futur
* Quand je crée ou fusionne les bénéficiaires depuis ces usagers
* Alors le bénéficiaire est créé sans année de naissance
