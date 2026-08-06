# Feature: Consulter l'employeuse courante d'un utilisateur

L'employeuse ne vit plus dans la coop : elle se lit dans `main`, en suivant
l'utilisateur jusqu'à sa personne, puis ses affectations emploi actives.

## Rule: L'employeuse courante est celle de l'affectation active prioritaire

### Scenario: Une seule affectation active

* Given un utilisateur affecté à "Association des tests" par la source "coop"
* When je consulte l'employeuse courante de cet utilisateur
* Then l'employeuse courante est "Association des tests"

### Scenario: Le dispositif conseiller numérique fait autorité sur le déclaratif

* Given un utilisateur affecté à "Structure déclarée" par la source "coop"
* And ce même utilisateur affecté à "Structure du dispositif" par la source "idposte"
* When je consulte l'employeuse courante de cet utilisateur
* Then l'employeuse courante est "Structure du dispositif"

### Scenario: Un utilisateur sans affectation active n'a pas d'employeuse

* Given un utilisateur sans affectation
* When je consulte l'employeuse courante de cet utilisateur
* Then cet utilisateur n'a pas d'employeuse courante

## Rule: Les dates d'emploi viennent du contrat, quand il en existe un

### Scenario: Un contrat ouvert donne une période en cours

* Given un utilisateur affecté à "Association des tests" par la source "coop"
* And un contrat chez "Association des tests" débuté le "2026-03-01"
* When je consulte l'employeuse courante de cet utilisateur
* Then la période d'emploi est en cours depuis le "2026-03-01"

### Scenario: Sans contrat, la période d'emploi reste inconnue

* Given un utilisateur affecté à "Association des tests" par la source "coop"
* When je consulte l'employeuse courante de cet utilisateur
* Then la période d'emploi est inconnue
