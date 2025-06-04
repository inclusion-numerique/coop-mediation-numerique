# Dossier d’architecture technique

> Ce dossier a pour but de présenter l’architecture technique du SI. Il n’est par conséquent ni un dossier
> d’installation, ni un dossier d’exploitation ou un dossier de spécifications fonctionnelles.
> Il est réalisé à partir du patron de
> [Dossier d'architecture technique](https://gitlab.com/groups/incubateur-territoires/startups/infrastructures-numeriques/-/wikis/Dossier-d'architecture-technique).

**Nom du projet :** La coop de la médiation numérique

**Dépôt de code :** https://github.com/inclusion-numerique/coop-mediation-numerique

**SecNumCloud :** Non

**Hébergeur :** Scaleway, Paris (région fr-par)

**Décision d’homologation :** Non décisionnée

**Inclusion numérique :** ✅

## Suivi du document

> Le suivi de ce document est assuré par le versionnage Git.

## Fiche de contrôle

> Cette fiche a pour vocation de lister l’ensemble des acteurs du projet ainsi que leur rôle dans la rédaction de ce
> dossier.

| Organisme                  | Nom            | Rôle           | Activité  |
|----------------------------|----------------|----------------|-----------|
| Pôle inclusion numérique   | Hugues Maignol | Lead tech      | Rédaction |
| Pôle inclusion numérique   | Marc Gavanier  | Lead tech      | Relecture |
| Pôle inclusion numérique   | Manon Galle    | Intrapreneure  | Relecture |
| Incubateur des territoires | Florian Busi   | Consultant SSI | Relecture |

## Description du projet

La coop de la médiation numérique est une plateforme dédiée aux professionnels
de la médiation numérique pour faciliter l’accompagnement des éloignés du numérique.

Il est open source, bien que les développements, l'hébergement et la maintenance soient gérés par l'équipe.

Plus d’infos sur la fiche beta : https://beta.gouv.fr/startups/suite.d.outils.des.mediateurs.numeriques.html

## Architecture

### Stack technique

Le projet est un monorepo écrit en Typescript, avec une base Postgres pour stocker les données.

L'infrastructure est gérée par Terraform, 100% en "infrastructure as code". L'hébergement est assuré par Scaleway.

Voici les librairies utilisées qui définissent la stack technique du projet :

- [TypeScript](https://www.typescriptlang.org/) : Le langage de programmation utilisé ici, c'est un langage open source
  qui s'appuie sur JavaScript en ajoutant un typage statique.
- [React](https://react.dev/) : Bibliothèque JavaScript qui permet de créer des interfaces utilisateurs interactives et
  prévisibles.
- [React Hook Form](https://react-hook-form.com/) : Bibliothèque de construction de formulaires avec React.
- [Next.js](https://nextjs.org/) : Framework full-stack pour construire des applications web avec React.
- [Système de Design de l'État (dsfr)](https://www.systeme-de-design.gouv.fr/) : Ensemble de composants réutilisables
  répondant aux standards de l'état.
- [React dsfr](https://github.com/codegouvfr/react-dsfr) : Surcouche de compatibilité React pour le Système de Design de
  l'État
- [Remix Icon](https://remixicon.com/) : Collection d'icônes.
- [Zod](https://zod.dev/) : Validation de schéma fondé sur TypeScript.
- [tRPC](https://trpc.io/) : Intégrer des API stables en bénéficiant de l'inférence de Type de TypeScript.
- [Prisma](https://www.prisma.io/) : ORM compatible avec TypeScript.
- [mjml-react](https://github.com/Faire/mjml-react) : Écrire des templates de mails avec React
  et [mjml](https://mjml.io/)
- [NextAuth.js](https://next-auth.js.org/) : Adaptateur pour services d'authentification.
- [Biome](https://biomejs.dev/) : Formatteur et linteur pour JavaScript, CSS et TypeScript.
- [Prettier](https://prettier.io/) : Formateur de code pour divers langages et syntaxes.
- [Jest](https://jestjs.io/) : Environnement d'exécution des tests unitaires.
- [Cypress](https://www.cypress.io) : Environnement d'exécution des tests de bout en bout et de tests de composants.
- [Storybook](https://storybook.js.org) : Permet de créer, documenter et tester des composants UI.
- [Sentry](https://sentry.io) : Plateforme de surveillance d'erreurs et de problèmes de performance.
- [MailDev](https://maildev.github.io/maildev/) : Serveur local et interface web pour capter les mails envoyés pendant
  le développement.

### Matrice des flux

#### Site internet

Le site internet est hébergé sur des containers applicatifs stateless Scaleway (node + next.js), qui scalent
horizontalement en fonction de la charge.

| Source               | Destination                  | Protocole | Port | Localisation | Interne/URL Externe                                                  |
|----------------------|------------------------------|-----------|------|--------------|----------------------------------------------------------------------|
| Navigateur           | Container Applicatif         | HTTPS     | 443  | fr-par       | lesbases.anct.gouv.fr                                                |
| Container Applicatif | Scaleway Postgresql          | TCP       | 5432 | fr-par       | Interne                                                              |
| Navigateur           | Object Storage (S3) Scaleway | HTTPS     | 443  | fr-par       | s3.fr-par.scw.cloud                                                  |
| Container Applicatif | Object Storage (S3) Scaleway | HTTPS     | 443  | fr-par       | Interne                                                              |
| Container Applicatif | Internet                     | HTTPS     | 443  | Monde        | récupération des données open graph des liens référencés sur le site |

#### Monitoring

| Source               | Destination | Protocole | Port | Localisation  | Interne/URL Externe            |
|----------------------|-------------|-----------|------|---------------|--------------------------------|
| Navigateur           | Sentry      | HTTPS     | 443  | Tours, France | sentry.incubateur.net          |
| Container Applicatif | Sentry      | HTTPS     | 443  | Tours, France | sentry.incubateur.net          |
| Navigateur           | Matomo      | HTTPS     | 443  | Tours, France | matomo.incubateur.anct.gouv.fr |

#### Services externes

| Source               | Destination                             | Protocole | Port | Localisation  | Interne/URL Externe |
|----------------------|-----------------------------------------|-----------|------|---------------|---------------------|
| Container Applicatif | Brevo (liste de contacts pour emailing) | HTTPS     | 443  | Paris, France | api.brevo.com       |
| Container Applicatif | Emails transactionnels Scaleway         | HTTPS     | 587  | Paris, France | smtp.tem.scw.cloud  |

#### Fournisseurs d'identité

| Source               | Destination | Protocole     | Port | Localisation | Interne/URL Externe       |
|----------------------|-------------|---------------|------|--------------|---------------------------|
| Navigateur           | ProConnect  | HTTPS (OAuth) | 443  | France       | auth.agentconnect.gouv.fr |
| Container Applicatif | ProConnect  | HTTPS (OAuth) | 443  | France       | auth.agentconnect.gouv.fr |

### Inventaire des dépendances

| Nom de l’applicatif    | Service    | Version | Commentaires                                                                                         |
|------------------------|------------|---------|------------------------------------------------------------------------------------------------------|
| Application web        | Next.js    | 14      | Voir ci-dessous pour le détail des librairies                                                        |
| Base de données        | PostgreSQL | 14      | Stockage des données métier, voir [/apps/web/prisma/schema.prisma](/apps/web/prisma/schema.prisma)   |
| Infrastructure as code | Terraform  | 1.5     | Voir [/packages/cdk/Readme.md](/packages/cdk/Readme.md) pour plus d’informations sur le provisioning |

La liste des dépendences nodejs est disponible dans :

- [/packages.json](/packages.json) pour la liste des dépendences du monorepo
- [/apps/cli/package.json](/apps/cli/package.json) pour la liste des dépendences de l'application cli
- [/apps/web/package.json](/apps/web/package.json) pour la liste des dépendences de l'application web
- [/packages/cdk/package.json](/packages/cdk/package.json) pour la liste des dépendences du package cdk
- [/packages/config/package.json](/packages/config/package.json) pour la liste des dépendences du package config
- [/packages/e2e/package.json](/packages/e2e/package.json) pour la liste des dépendences du package e2e
- [/packages/emails/package.json](/packages/emails/package.json) pour la liste des dépendences du package emails
- [/packages/fixtures/package.json](/packages/fixtures/package.json) pour la liste des dépendences du package fixtures
- [/packages/lint/package.json](/packages/lint/package.json) pour la liste des dépendences du package lint
- [/packages/storybook/package.json](/packages/storybook/package.json) pour la liste des dépendences du package
  storybook
- [/packages/test/package.json](/packages/test/package.json) pour la liste des dépendences du package test
- [/packages/ui/package.json](/packages/ui/package.json) pour la liste des dépendences du package ui
- [pnpm-lock.yaml](/pnpm-lock.yaml) pour la liste complète des librairies utilisées directement et indirectement et
  leurs versions précises

### Politique de mise à jour de l’application et des dépendances

#### Mises à jour de sécurité

Nous suivons les rapports de vulnérabilités sur les composants listés ci-dessus. Dependabot est utilisé pour surveiller
les vulnérabilités et les mises à jour de versions disponibles.

#### Mises à jour des librairies

Nous suivons les mises à jour des versions des librairies et les intégrons au fil de l’eau et adaptons le code applicatif pour utiliser les versions les plus stables et récentes disponibles et faciliter la maintenance.

#### Mises à jour fonctionnelles

Les mises à jour fonctionnelles sont effectuées en fonction de la roadmap et sont déployées en production régulièrement (environ une fois par semaine), après des tests unitaires, d'integration, et end-to-end pour s'assurer au maximum des non-régressions.


### Schéma de l’architecture

Notre application est accessible à l’adresse: https://coop-numerique.anct.gouv.fr

Nous déployons des instances temporaires pour chaque pull request, qui sont détruites au moment du merge.
Ces instances de validations suivent le format d'url suivant : https://<nom-de-la-branche-git>.coop-mediation-numerique.incubateur.anct.gouv.fr

```mermaid
flowchart TB
%% déclarations de nœuds
  nav[Navigateur]
  app[Container applicatif]
  pg[Scaleway PostgreSQL]
  s3[Object Storage S3 Scaleway]
  net[Internet]
  sentry[Sentry]
  matomo[Matomo]
  brevo[Brevo]
  smtp[Emails transactionnels Scaleway]
  proco[ProConnect]

%% Site internet
  nav -->|https 443<br/>lesbases.anct.gouv.fr| app
  app -->|tcp 5432<br/>Interne| pg
  nav -->|https 443<br/>s3.fr-par.scw.cloud| s3
  app -->|https 443<br/>Interne| s3
  app -->|https 443<br/>Monde| net

%% Monitoring
  nav -->|https 443<br/>sentry.incubateur.net| sentry
  app -->|https 443<br/>sentry.incubateur.net| sentry
  nav -->|https 443<br/>matomo.incubateur.anct.gouv.fr| matomo

%% Services externes
  app -->|https 443<br/>api.brevo.com| brevo
  app -->|https 587<br/>smtp.tem.scw.cloud| smtp

%% Fournisseurs d'identité
  nav -->|https OAuth 443<br/>auth.agentconnect.gouv.fr| proco
  app -->|https OAuth 443<br/>auth.agentconnect.gouv.fr| proco

```



### Gestion DNS

La zone DNS coop-numerique.anct.gouv.fr a été configurée par le SI de l’ANCT pour être gérée par Scaleway.

Les entrées DNS sont gérées par terraform comme les autres ressources de l'infrastructure.

### Schéma des données

Voir [/apps/web/prisma/schema.prisma](/apps/web/prisma/schema.prisma) pour la liste des tables et des champs.

A la date du 2025-06-04, voici le schéma des données :

```mermaid

classDiagram
direction BT
class _prisma_migrations {
   varchar(64) checksum
   timestamp with time zone finished_at
   varchar(255) migration_name
   text logs
   timestamp with time zone rolled_back_at
   timestamp with time zone started_at
   integer applied_steps_count
   varchar(36) id
}
class accompagnements {
   uuid beneficiaire_id
   uuid activite_id
   boolean premier_accompagnement
   uuid id
}
class accounts {
   uuid user_id
   text type
   text provider
   text provider_account_id
   text refresh_token
   text access_token
   integer expires_at
   text token_type
   text scope
   text id_token
   text session_state
   text id
}
class activites {
   type_activite type
   uuid mediateur_id
   date date
   integer duree
   text notes
   uuid structure_id
   text lieu_code_postal
   text lieu_commune
   text lieu_code_insee
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   type_lieu type_lieu
   autonomie autonomie
   structure_de_redirection structure_de_redirection
   materiel[] materiel
   thematique[] thematiques
   boolean oriente_vers_structure
   text precisions_demarche
   text titre_atelier
   niveau_atelier niveau
   integer rdv_service_public_id
   uuid id
}
class api_clients {
   text name
   text secret_hash
   timestamp(3) valid_from
   timestamp(3) valid_until
   api_client_scope[] scopes
   timestamp(3) created
   timestamp(3) updated
   uuid id
}
class assistant_chat_messages {
   timestamp(3) created
   jsonb[] parts
   jsonb[] annotations
   jsonb[] attachments
   text role
   uuid thread_id
   uuid id
}
class assistant_chat_threads {
   uuid created_by_id
   text title
   text context
   timestamp(3) created
   timestamp(3) updated
   timestamp(3) deleted
   uuid assistant_configuration_id
   uuid id
}
class assistant_configurations {
   uuid user_id
   text title
   text notes
   timestamp(3) created
   text model
   double precision frequency_penalty
   text function_call
   integer max_completion_tokens
   integer max_tokens
   boolean parallel_tool_calls
   double precision presence_penalty
   text reasoning_effort
   integer seed
   double precision temperature
   integer top_logprobs
   double precision top_p
   text system_message
   text search_tool_description
   uuid id
}
class beneficiaires {
   uuid mediateur_id
   boolean anonyme
   boolean attributionsAleatoires
   text prenom
   text nom
   text telephone
   boolean pas_de_telephone
   text email
   integer annee_naissance
   text adresse
   text commune
   text commune_code_postal
   text commune_code_insee
   genre genre
   tranche_age tranche_age
   statut_social statut_social
   text notes
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   timestamp(3) import
   integer rdv_service_public_id
   uuid id
}
class conseillers_numeriques {
   uuid mediateur_id
   integer id_pg
   text id
}
class coordinateurs {
   text conseiller_numerique_id
   uuid user_id
   timestamp(3) creation
   timestamp(3) modification
   integer conseiller_numerique_id_pg
   text[] autres_conseillers_v1_coordonnes
   uuid id
}
class cras_conseiller_numerique_v1 {
   timestamp(3) imported_at
   text canal
   text activite
   integer nb_participants
   integer nb_participants_recurrents
   integer age_moins_12_ans
   integer age_de_12_a_18_ans
   integer age_de_18_a_35_ans
   integer age_de_35_a_60_ans
   integer age_plus_60_ans
   integer statut_etudiant
   integer statut_sans_emploi
   integer statut_en_emploi
   integer statut_retraite
   integer statut_heterogene
   text[] themes
   text[] sous_themes_sante
   text duree
   integer accompagnement_individuel
   integer accompagnement_atelier
   integer accompagnement_redirection
   text code_postal
   text nom_commune
   timestamp(3) date_accompagnement
   text code_commune
   timestamp(3) created_at
   text structure_id
   integer structure_id_pg
   text structure_type
   text structure_statut
   text structure_nom
   text structure_siret
   text structure_code_postal
   text structure_nom_commune
   text structure_code_commune
   text structure_code_departement
   text structure_code_region
   text v1_conseiller_numerique_id
   text annotation
   text[] sous_themes_accompagner
   text[] sous_themes_equipement_informatique
   text[] sous_themes_traitement_texte
   jsonb organismes
   timestamp(3) updated_at
   integer duree_minutes
   text id
}
class employes_structures {
   uuid user_id
   uuid structure_id
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   uuid id
}
class images {
   integer legacy_id
   text alt_text
   text blur_url
   integer original_height
   integer original_width
   double precision crop_height
   double precision crop_width
   double precision crop_top
   double precision crop_left
   integer height
   integer width
   text upload_key
   uuid id
}
class invitations_equipes {
   text email
   uuid coordinateur_id
   uuid mediateur_id
   timestamp(3) creation
   timestamp(3) acceptee
   timestamp(3) refusee
}
class job_executions {
   text name
   timestamp(3) started
   timestamp(3) completed
   timestamp(3) errored
   integer duration
   jsonb data
   jsonb result
   text error
   uuid id
}
class mediateurs {
   uuid user_id
   timestamp(3) creation
   timestamp(3) modification
   boolean is_visible
   uuid id
}
class mediateurs_coordonnes {
   uuid mediateur_id
   uuid coordinateur_id
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   uuid id
}
class mediateurs_en_activite {
   uuid mediateur_id
   uuid structure_id
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   uuid id
}
class mutations {
   uuid user_id
   mutation_name nom
   integer duration
   jsonb data
   timestamp(3) timestamp
   uuid id
}
class rag_document_chunks {
   text source
   text type
   text content
   text source_id
   integer chunk
   text url
   timestamp(3) created
   timestamp(3) updated
   text embedding_model
   vector embedding
   text document_md5
   text title
   uuid id
}
class rdv_accounts {
   uuid user_id
   text access_token
   text refresh_token
   timestamp(3) expires_at
   text scope
   jsonb metadata
   timestamp(3) created
   timestamp(3) updated
   timestamp(3) last_synced
   text error
   integer id
}
class rdv_organisations {
   integer account_id
   text name
   text email
   text phone_number
   integer id
}
class sessions {
   text session_token
   uuid user_id
   timestamp(3) expires
   uuid usurper_id
   uuid id
}
class structures {
   text id_cartographie_nationale
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   text nom
   text adresse
   text commune
   varchar(5) code_postal
   varchar(5) code_insee
   text complement_adresse
   double precision latitude
   double precision longitude
   text siret
   text rna
   boolean visible_pour_cartographie_nationale
   text presentation_resume
   text presentation_detail
   text site_web
   text telephone
   text[] courriels
   text fiche_acces_libre
   text horaires
   text prise_rdv
   text[] autres_formations_labels
   text structure_parente
   text courriel_referent
   text nom_referent
   text telephone_referent
   typologie[] typologies
   service[] services
   public_specifiquement_adresse[] publics_specifiquement_adresses
   prise_en_charge_specifique[] prise_en_charge_specifique
   frais_a_charge[] frais_a_charge
   dispositif_programme_national[] dispositif_programmes_nationaux
   itinerance[] itinerance
   modalite_acces[] modalites_acces
   modalite_accompagnement[] modalites_accompagnement
   formation_label[] formations_labels
   uuid id
}
class structures_cartographie_nationale {
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   timestamp(3) creation_import
   timestamp(3) modification_import
   timestamp(3) suppression_import
   text[] conseiller_numerique_permanence_ids
   text coop_id
   text[] coop_ids
   text pivot
   text nom
   text commune
   varchar(5) code_postal
   varchar(5) code_insee
   text adresse
   text complement_adresse
   double precision latitude
   double precision longitude
   text typologie
   varchar(20) telephone
   text courriels
   text site_web
   text horaires
   text presentation_resume
   text presentation_detail
   text source
   text itinerance
   text structure_parente
   date date_maj
   text services
   text publics_specifiquement_adresses
   text prise_en_charge_specifique
   text frais_a_charge
   text dispositif_programmes_nationaux
   text formations_labels
   text autres_formations_labels
   text modalites_acces
   text modalites_accompagnement
   text fiche_acces_libre
   text prise_rdv
   text id
}
class tags {
   text nom
   text description
   text departement
   uuid mediateur_id
   timestamp(3) creation
   timestamp(3) modification
   timestamp(3) suppression
   uuid id
}
class uploads {
   text legacy_key
   text mime_type
   text name
   integer size
   uuid uploaded_by_id
   timestamp(3) created
   text key
}
class users {
   text first_name
   text last_name
   text name
   user_role role
   text email
   text phone
   timestamp(3) email_verified
   uuid image_id
   text location
   text title
   text description
   boolean is_fixture
   timestamp(3) created
   timestamp(3) updated
   timestamp(3) deleted
   timestamp(3) last_login
   profil_inscription profil_inscription
   timestamp(3) structure_employeuse_renseignee
   timestamp(3) lieux_activite_renseignes
   timestamp(3) inscription_validee
   timestamp(3) acceptation_cgu
   timestamp(3) has_seen_onboarding
   profil_inscription checked_profil_inscription
   timestamp(3) donnees_conseiller_numerique_v1_importees
   timestamp(3) donnees_coordinateur_conseiller_numerique_v1_importees
   user_feature_flag[] feature_flags
   text timezone
   uuid current_assistant_configuration_id
   uuid id
}
class verification_tokens {
   text identifier
   timestamp(3) expires
   text token
}

accompagnements  -->  activites : activite_id to id
accompagnements  -->  beneficiaires : beneficiaire_id to id
accounts  -->  users : user_id to id
activites  -->  mediateurs : mediateur_id to id
activites  -->  structures : structure_id to id
assistant_chat_messages  -->  assistant_chat_threads : thread_id to id
assistant_chat_threads  -->  assistant_configurations : assistant_configuration_id to id
assistant_chat_threads  -->  users : created_by_id to id
assistant_configurations  -->  users : user_id to id
beneficiaires  -->  mediateurs : mediateur_id to id
conseillers_numeriques  -->  mediateurs : mediateur_id to id
coordinateurs  -->  users : user_id to id
cras_conseiller_numerique_v1  -->  structures : structure_id to id
employes_structures  -->  structures : structure_id to id
employes_structures  -->  users : user_id to id
images  -->  uploads : upload_key to key
invitations_equipes  -->  coordinateurs : coordinateur_id to id
invitations_equipes  -->  mediateurs : mediateur_id to id
mediateurs  -->  users : user_id to id
mediateurs_coordonnes  -->  coordinateurs : coordinateur_id to id
mediateurs_coordonnes  -->  mediateurs : mediateur_id to id
mediateurs_en_activite  -->  mediateurs : mediateur_id to id
mediateurs_en_activite  -->  structures : structure_id to id
mutations  -->  users : user_id to id
rdv_accounts  -->  users : user_id to id
rdv_organisations  -->  accounts : account_id to id
rdv_organisations  -->  rdv_accounts : account_id to id
sessions  -->  users : user_id to id
sessions  -->  users : usurper_id to id
structures  -->  structures_cartographie_nationale : id_cartographie_nationale to id
tags  -->  mediateurs : mediateur_id to id
uploads  -->  users : uploaded_by_id to id
users  -->  assistant_configurations : current_assistant_configuration_id to id
users  -->  images : image_id to id


```

## Exigences générales

### Accès aux serveurs et sécurité des échanges

Les serveurs (applicatif et base de données) sont gérés par Scaleway dans l'organisation de l'incubateur des
territoires, dans le projet "coop-mediation-numerique".
L'équipe transverse de l'Incubateur des Territoires administre les droits d'accès via le système "IAM" utilisé par
Scaleway.

Les accès Scalingo sont octroyés uniquement à l'équipe technique (Développeurs et Product manager) pour :

- surveiller la santé de l'app de production (logs et metrics)
- ajouter ou mettre à jour des secrets
- executer des opérations manuelles sur les services Scaleway en cas de panne

Scaleway propose du 2FA par TOTP, et tous les membres de l'équipe se doivent de l'activer.

Les secrets sont gérés par le service Secret Manager de Scaleway.

#### Détection de fuite de secrets et de vulnérabilités

Nous avons activé des services Github pour la detection de vulnérabilités et de fuites de secrets.

- Privae vulnerability reporting
- Dependabot alerts
- Dependabot security updates
- CodeQL analysis
- Secret Protection

### Authentification, contrôle d’accès, habilitations et profils

L'application a 3 rôles pour les utilisateurs :

- Utilisateurs
- Administrateurs
- Support

Les rôle Administrateur et Support ont accès à un backoffice pour gérer les utilisateurs et données du
site.

### Traçabilité des erreurs et des actions utilisateurs

#### Logs textuels

Les logs textuels sont envoyés dans un service "Kibana" managé par Scaleway (Cockpit).

La consultation des logs textuels ne se fait que lors d'investigations de bugs. Leur usage est donc uniquement ponctuel
et leur consultation est manuelle.

#### Traçabilité applicative / auditing

Nous ne traçons pas les actions des utilisateurs.

Cependant les mutations des modèles métiers sont enregistrées dans une table "mutation_logs" a des fins de débuggage.

#### Monitoring d'erreur

Nous utilisons Sentry afin d'être informés sur les nouvelles erreurs, et le volume des erreurs existantes.
Nous utilisons l'instance Sentry de l'incubateur beta.gouv (sentry.incubateur.net).

#### Supervision

Nous utilisons Grafana via le service Cockpit de Scaleway pour la supervision des performances et des alertes (CPU, Mémoire, Réseau, etc).

### Intégrité

#### Données métier

Trois types de sauvegardes automatiques sont effectuées sur la base de données de production, avec des fréquences et
durées de rétention adaptées à différents besoins :

| Type de sauvegarde | Fréquence                | Expiration | Utilité principale                                                         |
|--------------------|--------------------------|------------|----------------------------------------------------------------------------|
| **Horaire**        | Toutes les heures        | 4 jours    | Restaurer des états très récents (erreurs critiques, rollback court terme) |
| **Quotidienne**    | Tous les jours à minuit  | 90 jours   | Sauvegarde classique, rollback et audit sur 3 mois                         |
| **Hebdomadaire**   | Chaque dimanche à minuit | 600 jours  | Archivage long terme et conformité réglementaire                           |

#### Fichiers uploadés

Les fichiers uploadés sont gérés par Scaleway (Object Storage) en haute disponibilité Multi-AZ.

### Confidentialité

Nous ne manipulons pas de données sensibles.
Lors de leur inscription, les utilisateurs nous transmettent :

- leur email
- leur prénom et nom

Ces données sont partagées avec le programme société numérique de l’ANCT via une API privée.

Les utilisateurs peuvent choisir d’enregistrer les bénéficiaires accompagnés et peuvent enregistrer :

- nom, prenom
- année de naissance
- tranche d’age
- genre
- numéro de téléphone
- email
- commune

Ces données ne sont pas partagées et sont uniquement accessibles par l’utilisateur qui les a saisies.
