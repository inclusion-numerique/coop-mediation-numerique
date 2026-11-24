# Feature: Vérifier ses informations

> Pendant l'inscription, la personne relit ce que la coop sait d'elle : son
> profil, son nom, son adresse électronique et son employeuse. L'étape décide
> ensuite où la mener, selon son profil et selon que son employeuse est connue
> ou non.

## Rule: L'étape suivante dépend du profil et de l'employeuse connue

### Scenario: Un médiateur dont l'employeuse est connue confirme ses lieux d'activité depuis elle

* Given un inscrit au profil "médiateur"
* And employé par "Médiathèque de Villeurbanne"
* When il vérifie ses informations
* Then l'étape suivante est "/inscription/lieux-activite/structure-employeuse"

### Scenario: Un médiateur dont l'employeuse n'est pas connue la renseigne d'abord

* Given un inscrit au profil "médiateur"
* When il vérifie ses informations
* Then l'étape suivante est "/inscription/renseigner-structure-employeuse"

### Scenario: Un conseiller numérique dont l'employeuse est connue confirme ses lieux d'activité depuis elle

* Given un inscrit au profil "conseiller numérique"
* And employé par "Médiathèque de Villeurbanne"
* When il vérifie ses informations
* Then l'étape suivante est "/inscription/lieux-activite/structure-employeuse"

### Scenario: Un coordinateur passe directement au récapitulatif

* Given un inscrit au profil "coordinateur"
* And employé par "Département du Rhône"
* When il vérifie ses informations
* Then l'étape suivante est "/inscription/recapitulatif"

## Rule: Le retour mène au choix du rôle

### Scenario: Le retour mène au choix du rôle

* Given un inscrit au profil "médiateur"
* When il vérifie ses informations
* Then le retour mène à "/inscription/choisir-role"

## Rule: Le profil affiché est celui choisi, ou « Non renseigné »

### Scenario: Le profil choisi est affiché par son libellé

* Given un inscrit au profil "médiateur"
* When il vérifie ses informations
* Then le profil affiché est "Médiateur·rice numérique"

### Scenario: Sans profil choisi, le profil est « Non renseigné »

* Given un inscrit qui n'a pas encore choisi de profil
* When il vérifie ses informations
* Then le profil affiché est "Non renseigné"

## Rule: L'employeuse affichée est la première connue, même sans dénomination

### Scenario: L'employeuse connue est affichée

* Given un inscrit au profil "médiateur"
* And employé par "Médiathèque de Villeurbanne"
* When il vérifie ses informations
* Then l'employeuse affichée est "Médiathèque de Villeurbanne"

### Scenario: Une employeuse sans dénomination est affichée sans nom

* Given un inscrit au profil "médiateur"
* And employé par une structure sans dénomination
* When il vérifie ses informations
* Then l'employeuse affichée est ""

### Scenario: Sans employeuse connue, aucune n'est affichée

* Given un inscrit au profil "médiateur"
* When il vérifie ses informations
* Then aucune employeuse n'est affichée
