# Fonctionnalité: Rattacher un utilisateur à son employeuse

Écriture unique de l'employeuse, partagée par le choix Sirene à l'inscription,
l'import par SIRET et les claims ProConnect. Rattacher, c'est affirmer
l'employeur **courant**.

## Règle: Le rattachement pose une affectation active

### Scénario: Un utilisateur sans employeuse

* Étant donné une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* Et un utilisateur nouvellement inscrit
* Quand je le rattache à "Association des tests"
* Alors il est rattaché à "Association des tests"
* Et son rattachement à "Association des tests" est actif

### Scénario: Rattacher deux fois à la même employeuse ne crée qu'un rattachement

* Étant donné une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* Et un utilisateur nouvellement inscrit
* Quand je le rattache à "Association des tests"
* Et je le rattache à nouveau à "Association des tests"
* Alors il a 1 rattachement déclaré par la coop

## Règle: Un seul employeur courant à la fois

### Scénario: Changer d'employeuse clôt la précédente

* Étant donné une employeuse "Premier employeur" enregistrée avec le SIRET "12345678901234"
* Et une employeuse "Second employeur" enregistrée avec le SIRET "43210987654321"
* Et un utilisateur nouvellement inscrit
* Quand je le rattache à "Premier employeur"
* Et je le rattache à "Second employeur"
* Alors son rattachement à "Second employeur" est actif
* Et son rattachement à "Premier employeur" est terminé

## Règle: Les rattachements des autres sources appartiennent à l'Entrepôt

### Scénario: Une affectation du dispositif survit au rattachement déclaré

* Étant donné une employeuse "Employeuse du dispositif" enregistrée avec le SIRET "43210987654321"
* Et une employeuse "Association des tests" enregistrée avec le SIRET "12345678901234"
* Et un utilisateur nouvellement inscrit
* Et ce utilisateur affecté par le dispositif à "Employeuse du dispositif"
* Quand je le rattache à "Association des tests"
* Alors son affectation du dispositif à "Employeuse du dispositif" est toujours active
