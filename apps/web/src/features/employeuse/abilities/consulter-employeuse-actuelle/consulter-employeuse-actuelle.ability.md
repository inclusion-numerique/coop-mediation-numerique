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

## Rule: Un terme encore à venir ne termine pas l'emploi

Un contrat à durée déterminée porte sa date de fin dès sa signature. La constater
ne suffit donc pas : il faut la comparer à aujourd'hui, sans quoi tout CDD est
annoncé terminé alors que la personne est en poste pour des mois encore.

### Scenario: Un contrat dont le terme est encore devant reste en cours

* Given un utilisateur affecté à "Association des tests" par la source "coop"
* And un contrat chez "Association des tests" courant du "2026-03-01" au "2099-12-31"
* When je consulte l'employeuse courante de cet utilisateur
* Then la période d'emploi est en cours depuis le "2026-03-01" jusqu'au "2099-12-31"

### Scenario: Un contrat dont le terme est passé est bien terminé

* Given un utilisateur affecté à "Association des tests" par la source "coop"
* And un contrat chez "Association des tests" courant du "2020-01-01" au "2020-12-31"
* When je consulte l'employeuse courante de cet utilisateur
* Then la période d'emploi est terminée le "2020-12-31"
