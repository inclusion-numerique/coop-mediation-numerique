# Fonctionnalité: Consulter l'employeuse courante d'un utilisateur

L'employeuse ne vit plus dans la coop : elle se lit dans `main`, en suivant
l'utilisateur jusqu'à sa personne, puis ses affectations emploi actives.

## Règle: L'employeuse courante est celle de l'affectation active prioritaire

### Scénario: Une seule affectation active

* Étant donné un utilisateur affecté à "Association des tests" par la source "coop"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Association des tests"

### Scénario: Le dispositif conseiller numérique fait autorité sur le déclaratif

* Étant donné un utilisateur affecté à "Structure déclarée" par la source "coop"
* Et ce même utilisateur affecté à "Structure du dispositif" par la source "idposte"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Structure du dispositif"

### Scénario: Hors du dispositif, le déclaratif fait autorité sur les autres sources

* Étant donné un utilisateur affecté à "Structure déclarée" par la source "coop"
* Et ce même utilisateur affecté à "Structure d'un autre service" par la source "aidants-connect"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Structure déclarée"

### Scénario: À source égale, l'affectation la plus récente l'emporte

* Étant donné un utilisateur sans affectation
* Et ce même utilisateur affecté à "Ancienne structure" par la source "coop" le "2025-01-01"
* Et ce même utilisateur affecté à "Nouvelle structure" par la source "coop" le "2026-06-01"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Nouvelle structure"

### Scénario: À date égale, la dernière affectation enregistrée l'emporte

* Étant donné un utilisateur sans affectation
* Et ce même utilisateur affecté à "Première structure" par la source "coop" le "2026-06-01"
* Et ce même utilisateur affecté à "Seconde structure" par la source "coop" le "2026-06-01"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Seconde structure"

### Scénario: Une affectation qui n'est plus active ne désigne pas l'employeuse

* Étant donné un utilisateur affecté à "Structure actuelle" par la source "coop"
* Et ce même utilisateur anciennement affecté à "Structure du dispositif" par la source "idposte"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors l'employeuse courante est "Structure actuelle"

### Scénario: Un utilisateur sans affectation active n'a pas d'employeuse

* Étant donné un utilisateur sans affectation
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors cet utilisateur n'a pas d'employeuse courante

## Règle: Les dates d'emploi viennent du contrat, quand il en existe un

### Scénario: Un contrat ouvert donne une période en cours

* Étant donné un utilisateur affecté à "Association des tests" par la source "coop"
* Et un contrat chez "Association des tests" débuté le "2026-03-01"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors la période d'emploi est en cours depuis le "2026-03-01"

### Scénario: Sans contrat, la période d'emploi reste inconnue

* Étant donné un utilisateur affecté à "Association des tests" par la source "coop"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors la période d'emploi est inconnue

## Règle: Un terme encore à venir ne termine pas l'emploi

Un contrat à durée déterminée porte sa date de fin dès sa signature. La constater
ne suffit donc pas : il faut la comparer à aujourd'hui, sans quoi tout CDD est
annoncé terminé alors que la personne est en poste pour des mois encore.

### Scénario: Un contrat dont le terme est encore devant reste en cours

* Étant donné un utilisateur affecté à "Association des tests" par la source "coop"
* Et un contrat chez "Association des tests" courant du "2026-03-01" au "2099-12-31"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors la période d'emploi est en cours depuis le "2026-03-01" jusqu'au "2099-12-31"

### Scénario: Un contrat dont le terme est passé est bien terminé

* Étant donné un utilisateur affecté à "Association des tests" par la source "coop"
* Et un contrat chez "Association des tests" courant du "2020-01-01" au "2020-12-31"
* Quand je consulte l'employeuse courante de cet utilisateur
* Alors la période d'emploi est terminée le "2020-12-31"
