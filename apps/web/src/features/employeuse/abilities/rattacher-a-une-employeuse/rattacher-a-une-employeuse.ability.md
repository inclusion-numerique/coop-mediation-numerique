# Feature: Rattacher un utilisateur à son employeuse

Écriture unique de l'employeuse, partagée par le choix Sirene à l'inscription,
l'import par SIRET et les claims ProConnect. Rattacher, c'est affirmer
l'employeur **courant**.

## Rule: Le rattachement pose une affectation active

### Scenario: Un utilisateur sans employeuse

* Given une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* And un utilisateur nouvellement inscrit
* When je le rattache à "Association des tests"
* Then il est rattaché à "Association des tests"
* And son rattachement à "Association des tests" est actif

### Scenario: Rattacher deux fois à la même employeuse ne crée qu'un rattachement

* Given une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* And un utilisateur nouvellement inscrit
* When je le rattache à "Association des tests"
* And je le rattache à nouveau à "Association des tests"
* Then il a 1 rattachement déclaré par la coop

## Rule: Un seul employeur courant à la fois

### Scenario: Changer d'employeuse clôt la précédente

* Given une employeuse "Premier employeur" enregistrée avec le SIRET "12345678901234"
* And une employeuse "Second employeur" enregistrée avec le SIRET "43210987654321"
* And un utilisateur nouvellement inscrit
* When je le rattache à "Premier employeur"
* And je le rattache à "Second employeur"
* Then son rattachement à "Second employeur" est actif
* And son rattachement à "Premier employeur" est terminé

## Rule: Les rattachements des autres sources appartiennent à l'Entrepôt

### Scenario: Une affectation du dispositif survit au rattachement déclaré

* Given une employeuse "Employeuse du dispositif" enregistrée avec le SIRET "43210987654321"
* And une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* And un utilisateur nouvellement inscrit
* And ce utilisateur affecté par le dispositif à "Employeuse du dispositif"
* When je le rattache à "Association des tests"
* Then son affectation du dispositif à "Employeuse du dispositif" est toujours active
