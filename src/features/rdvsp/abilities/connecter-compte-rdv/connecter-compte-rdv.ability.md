# Fonctionnalité: Connecter un compte RDV Service Public

## Règle: La liaison exige que l'agent porte la même adresse e-mail que le compte La Coop

### Scénario: Lier un compte dont l'e-mail correspond

* Étant donné un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte est lié
* Et le compte est enregistré avec les jetons reçus

### Scénario: Refuser un compte dont l'e-mail diffère

* Étant donné un agent RDV Service Public portant l’e-mail "autre.agent@example.com"
* Quand je connecte mon compte RDV Service Public
* Alors la connexion échoue avec l’erreur "EmailAgentDifferent"
* Et aucun compte RDV n’est enregistré

## Règle: La fenêtre de synchronisation n'est ouverte qu'à la première connexion

### Scénario: Première connexion

* Étant donné un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors la synchronisation démarre au début du jour courant

### Scénario: Reconnexion d'un compte existant

* Étant donné un compte RDV déjà lié synchronisé depuis le "2026-01-15"
* Et un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors la synchronisation démarre toujours au "2026-01-15"

## Règle: Une reconnexion répare le compte sans rien détruire

### Scénario: Reconnecter un compte en erreur

* Étant donné un compte RDV en erreur "invalid_grant"
* Et un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte est lié
* Et le compte ne porte plus d’erreur

### Scénario: Reconnecter un compte déconnecté

* Étant donné un compte RDV déconnecté
* Et un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte est lié
* Et le compte n’est plus marqué déconnecté

### Scénario: Reconnexion préservant les réglages du médiateur

* Étant donné un compte RDV déjà lié affichant les rendez-vous dans les activités
* Et un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte affiche toujours les rendez-vous dans les activités

### Scénario: Reconnexion préservant l'affichage des rendez-vous désactivé

* Étant donné un compte RDV déjà lié masquant les rendez-vous dans les activités
* Et un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte masque toujours les rendez-vous dans les activités

## Règle: Une première connexion affiche les rendez-vous dans les activités

### Scénario: Première connexion affichant les rendez-vous

* Étant donné un agent RDV Service Public portant l’e-mail du médiateur
* Quand je connecte mon compte RDV Service Public
* Alors le compte connecté affiche les rendez-vous dans les activités

## Règle: Un code d'autorisation refusé interrompt la liaison

### Scénario: Code refusé par RDV Service Public

* Étant donné un code d’autorisation refusé
* Quand je connecte mon compte RDV Service Public
* Alors la connexion échoue avec l’erreur "CodeAutorisationRefuse"
* Et aucun compte RDV n’est enregistré
