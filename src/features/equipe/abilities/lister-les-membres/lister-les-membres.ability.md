# Fonctionnalité: Lister les membres d'une équipe

## Contexte:

* Étant donné une équipe composée d'un membre actif, d'un membre inactif, d'un ancien membre revenu, d'un ancien membre et d'une invitation en attente

## Règle: La liste montre chaque personne une seule fois, avec son statut

### Scénario: Le coordinateur consulte toute son équipe

* Quand le coordinateur consulte son équipe
* Alors la liste compte 5 lignes
* Et le médiateur revenu n'apparaît qu'une fois, comme membre actif

### Scénario: Les compteurs s'additionnent

> Un membre dont le profil a été supprimé rejoint les archives : le total ne
> compte que les membres actifs et inactifs.

* Étant donné un membre dont le profil a été supprimé
* Quand le coordinateur consulte son équipe
* Alors l'équipe compte 3 membres, dont 2 actifs et 1 inactif
* Et 1 invitation est en attente
* Et 2 personnes sont aux archives

### Scénario: Le coordinateur filtre les archives

* Quand le coordinateur consulte les archives de son équipe
* Alors la liste compte 1 ligne
* Et cette ligne est un ancien membre

## Règle: La recherche est un texte, jamais une instruction

### Scénario: Une recherche contenant des caractères spéciaux ne casse rien

* Quand le coordinateur cherche "x' OR '1'='1" dans son équipe
* Alors la liste compte 0 ligne

### Scénario: La recherche trouve un membre par son email

* Quand le coordinateur cherche l'email du membre actif dans son équipe
* Alors la liste compte 1 ligne

## Règle: Seuls les membres actifs, le coordinateur et les administrateurs consultent une équipe

### Scénario: Un membre actif consulte son équipe

* Quand le membre actif consulte son équipe
* Alors la consultation réussit

### Scénario: Le coordinateur d'une autre équipe ne peut pas la consulter

* Quand le coordinateur d'une autre équipe consulte cette équipe
* Alors la consultation est refusée
