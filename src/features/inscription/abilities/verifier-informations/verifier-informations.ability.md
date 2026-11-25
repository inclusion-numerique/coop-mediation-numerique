# Fonctionnalité: Vérifier ses informations

> Pendant l'inscription, la personne relit ce que la coop sait d'elle : son
> profil, son nom, son adresse électronique et son employeuse. L'étape décide
> ensuite où la mener, selon son profil et selon que son employeuse est connue
> ou non.

## Règle: L'étape suivante dépend du profil et de l'employeuse connue

### Scénario: Un médiateur dont l'employeuse est connue confirme ses lieux d'activité depuis elle

* Étant donné un inscrit au profil "médiateur"
* Et employé par "Médiathèque de Villeurbanne"
* Quand il vérifie ses informations
* Alors l'étape suivante est "/inscription/lieux-activite/structure-employeuse"

### Scénario: Un médiateur dont l'employeuse n'est pas connue la renseigne d'abord

* Étant donné un inscrit au profil "médiateur"
* Quand il vérifie ses informations
* Alors l'étape suivante est "/inscription/renseigner-structure-employeuse"

### Scénario: Un conseiller numérique dont l'employeuse est connue confirme ses lieux d'activité depuis elle

* Étant donné un inscrit au profil "conseiller numérique"
* Et employé par "Médiathèque de Villeurbanne"
* Quand il vérifie ses informations
* Alors l'étape suivante est "/inscription/lieux-activite/structure-employeuse"

### Scénario: Un coordinateur passe directement au récapitulatif

* Étant donné un inscrit au profil "coordinateur"
* Et employé par "Département du Rhône"
* Quand il vérifie ses informations
* Alors l'étape suivante est "/inscription/recapitulatif"

## Règle: Le retour mène au choix du rôle

### Scénario: Le retour mène au choix du rôle

* Étant donné un inscrit au profil "médiateur"
* Quand il vérifie ses informations
* Alors le retour mène à "/inscription/choisir-role"

## Règle: Le profil affiché est celui choisi, ou « Non renseigné »

### Scénario: Le profil choisi est affiché par son libellé

* Étant donné un inscrit au profil "médiateur"
* Quand il vérifie ses informations
* Alors le profil affiché est "Médiateur·rice numérique"

### Scénario: Sans profil choisi, le profil est « Non renseigné »

* Étant donné un inscrit qui n'a pas encore choisi de profil
* Quand il vérifie ses informations
* Alors le profil affiché est "Non renseigné"

## Règle: L'employeuse affichée est la première connue, même sans dénomination

### Scénario: L'employeuse connue est affichée

* Étant donné un inscrit au profil "médiateur"
* Et employé par "Médiathèque de Villeurbanne"
* Quand il vérifie ses informations
* Alors l'employeuse affichée est "Médiathèque de Villeurbanne"

### Scénario: Une employeuse sans dénomination est affichée sans nom

* Étant donné un inscrit au profil "médiateur"
* Et employé par une structure sans dénomination
* Quand il vérifie ses informations
* Alors l'employeuse affichée est ""

### Scénario: Sans employeuse connue, aucune n'est affichée

* Étant donné un inscrit au profil "médiateur"
* Quand il vérifie ses informations
* Alors aucune employeuse n'est affichée
