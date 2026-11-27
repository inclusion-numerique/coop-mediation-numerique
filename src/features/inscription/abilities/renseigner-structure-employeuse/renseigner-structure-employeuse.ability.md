# Fonctionnalité: Renseigner sa structure employeuse

Le rattachement lui-même appartient à la feature employeuse — c'est elle qui
décide de créer ou réutiliser la structure, et qui clôt le rattachement
précédent. Ces scénarios ne couvrent donc que ce que l'inscription décide :
quand rattacher, et ce qu'il faut conclure d'un échec.

## Règle: Renseigner une structure la rattache comme employeuse et marque l'étape franchie

### Scénario: Renseigner une structure employeuse

* Étant donné j’ai choisi le profil "Mediateur"
* Quand je renseigne ma structure employeuse
* Alors ma structure employeuse est renseignée
* Et le rattachement à l’employeuse a été demandé

## Règle: L'étape n'est franchie que si le rattachement a abouti

### Scénario: L'employeuse choisie n'est pas rattachable

* Étant donné j’ai choisi le profil "Mediateur"
* Et l’employeuse choisie n’est pas rattachable
* Quand je renseigne ma structure employeuse
* Alors le renseignement est refusé faute d’employeuse rattachable
* Et ma structure employeuse n’est pas renseignée

## Règle: Une étape ne se franchit pas avant que le profil ne soit choisi

### Scénario: Renseigner sa structure avant d'avoir choisi son rôle

* Quand je renseigne ma structure employeuse
* Alors le renseignement est refusé faute de profil choisi
* Et ma structure employeuse n’est pas renseignée
