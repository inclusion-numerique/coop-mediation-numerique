# Fonctionnalité: Déconnecter un compte RDV Service Public

## Règle: Déconnecter purge les jetons et rien d'autre

### Scénario: Délier un compte lié

* Étant donné un compte RDV lié à déconnecter
* Quand je déconnecte mon compte RDV Service Public
* Alors le compte est marqué déconnecté
* Et les jetons du compte sont purgés

### Scénario: La synchronisation reste reprenable après une déconnexion

* Étant donné un compte RDV à déconnecter synchronisé depuis le "2026-01-15"
* Quand je déconnecte mon compte RDV Service Public
* Alors la fenêtre de synchronisation du compte est conservée au "2026-01-15"

### Scénario: Les réglages du médiateur survivent à la déconnexion

* Étant donné un compte RDV à déconnecter affichant les rendez-vous dans les activités
* Quand je déconnecte mon compte RDV Service Public
* Alors le compte déconnecté affiche toujours les rendez-vous dans les activités

## Règle: Déconnecter est possible quel que soit l'état du compte

### Scénario: Délier un compte en erreur

* Étant donné un compte RDV à déconnecter en erreur "invalid_grant"
* Quand je déconnecte mon compte RDV Service Public
* Alors le compte est marqué déconnecté
* Et le compte déconnecté ne porte plus d’erreur

### Scénario: Redélier un compte déjà délié ne réécrit pas la date

* Étant donné un compte RDV déjà déconnecté le "2026-07-08"
* Quand je déconnecte mon compte RDV Service Public
* Alors la date de déconnexion reste le "2026-07-08"

## Règle: Un médiateur sans compte n'a rien à délier

### Scénario: Déconnexion sans compte lié

* Étant donné aucun compte RDV pour ce médiateur
* Quand je déconnecte mon compte RDV Service Public
* Alors la déconnexion échoue avec l’erreur "CompteRdvIntrouvable"
