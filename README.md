# Fitness App

A fitness tracking platform built with Spring Boot microservices, Keycloak-based authentication, and an AI recommendation pipeline.

## Features

- Microservice-based backend architecture
- Centralized configuration with Spring Cloud Config Server
- Service discovery with Eureka
- API routing through Spring Cloud Gateway
- Authentication and user management with Keycloak
- User profile persistence in MySQL
- Activity tracking in MongoDB
- Asynchronous activity processing with RabbitMQ
- AI-generated workout recommendations powered by Gemini
- React frontend with OAuth2 PKCE login flow

## Architecture

The project is split into the following modules:

- `configserver` - serves centralized configuration to backend services
- `eureka` - service registry and discovery server
- `gateway` - API gateway, JWT validation, Keycloak integration, and request forwarding
- `userservice` - manages user profile data in MySQL
- `activityservice` - stores fitness activities in MongoDB and publishes activity events
- `aiservice` - consumes activity events, calls Gemini, and stores recommendations
- `fitness-microservice-frontend` - React frontend for signup, login, activity tracking, and recommendation viewing

## High-Level Flow

1. A user signs up through the gateway.
2. The gateway creates the user in Keycloak.
3. The gateway stores or syncs the user profile in `userservice`.
4. The user logs in through Keycloak using OAuth2 Authorization Code with PKCE.
5. The frontend calls the gateway with a bearer token.
6. The gateway validates the JWT and injects `X-USER-ID` into downstream requests.
7. The user creates an activity.
8. `activityservice` stores the activity and publishes an event to RabbitMQ.
9. `aiservice` consumes the event, calls Gemini, and stores the recommendation.
10. The frontend polls and displays the generated recommendation.

## Tech Stack

### Backend

- Java 17
- Spring Boot `4.0.5`
- Spring Cloud `2025.1.1`
- Spring Cloud Gateway
- Spring Security OAuth2 Resource Server
- Spring Data JPA
- Spring Data MongoDB
- Spring AMQP

### Infrastructure

- MySQL
- MongoDB
- RabbitMQ
- Keycloak
- Eureka
- Spring Cloud Config Server

### Frontend

- React
- Vite
- Material UI
- Redux Toolkit
- Axios
- React Router
- `react-oauth2-code-pkce`

## Services and Ports

| Service | Port |
| --- | --- |
| Config Server | `8888` |
| Eureka | `8761` |
| Gateway | `8080` |
| User Service | `8081` |
| Activity Service | `8082` |
| AI Service | `8083` |
| Frontend | `5173` |
| Keycloak | `8181` |

## Data Stores and Messaging

| Component | Value |
| --- | --- |
| MySQL database | `fitness_user` |
| Activity MongoDB database | `fitness_activity` |
| Recommendation MongoDB database | `fitness_recommendation` |
| RabbitMQ exchange | `fitness.exchange` |
| RabbitMQ queue | `activity.queue` |
| RabbitMQ routing key | `activity.tracking` |

## Configuration

`configserver` uses native configuration and serves files from:

- `classpath:/config`

Configuration files present in the project:

- `user-service.yml`
- `activity-service.yml`
- `ai-service.yml`
- `gateway.yml`

Each backend service uses a matching `spring.application.name` and imports configuration from the config server.

## Service Discovery

All business services register with Eureka at:

```text
http://localhost:8761/eureka/
```

## Authentication and Security

### Keycloak

The project uses Keycloak for authentication.

- Realm: `fitness-oauth2`
- Frontend client ID: `oauth2-pkce-client`

The frontend uses OAuth2 Authorization Code with PKCE.

### Gateway Security

The gateway:

- validates JWTs using Keycloak JWKs
- exposes `POST /auth/register` without authentication
- requires authentication for all other endpoints
- injects `X-USER-ID` into forwarded requests
- auto-syncs authenticated users into `userservice`

### Keycloak Admin Flow

The gateway also uses the Keycloak Admin API to:

- create a user
- set the user's password
- retrieve the Keycloak user ID
- sync the user profile into `userservice`

## API Routing

The gateway routes requests as follows:

- `/fitness/users/**` -> `USER-SERVICE`
- `/fitness/activities/**` -> `ACTIVITY-SERVICE`
- `/fitness/recommendations/**` -> `AI-SERVICE`

## Services

### User Service

Stores application user profiles in MySQL.

#### Main Responsibilities

- create or sync users
- validate users by Keycloak ID
- fetch user profiles

#### Entity Fields

- `id`
- `email`
- `keycloakId`
- `password`
- `firstname`
- `lastname`
- `role`
- `createdAt`
- `updatedAt`

#### Endpoints

- `GET /fitness/users/{userId}` - get profile by Keycloak ID
- `POST /fitness/users/register` - create or sync user
- `GET /fitness/users/{userId}/validate` - validate user existence

#### Notes

- If the email already exists, the existing user is returned.
- If an existing user is missing `keycloakId`, it is updated during sync.
- Authentication is handled by Keycloak, but the service still stores a placeholder password field.

### Activity Service

Stores activities in MongoDB and publishes activity events to RabbitMQ.

#### Main Responsibilities

- validate the current user through `userservice`
- store activities
- publish saved activities for AI processing

#### Activity Fields

- `id`
- `userId`
- `type`
- `duration`
- `caloriesBurned`
- `startTime`
- `additionalMetrics`
- `createdAt`
- `updatedAt`

#### Supported Activity Types

- `RUNNING`
- `WALKING`
- `CYCLING`
- `SWIMMING`
- `WEIGHT_TRAINING`
- `YOGA`
- `CARDIO`
- `STRETCHING`
- `OTHER`

#### Endpoints

- `POST /fitness/activities`
- `GET /fitness/activities`
- `GET /fitness/activities/{activityId}`
- `DELETE /fitness/activities/{activityId}`

#### Example Request

```json
{
  "type": "RUNNING",
  "duration": 30,
  "caloriesBurned": 280,
  "startTime": "2026-04-28T07:30:00",
  "additionalMetrics": {
    "distance": 5.2,
    "pace": 5.45
  }
}
```

#### Note

The delete endpoint currently does not verify ownership before deleting an activity.

### AI Service

Consumes activity events, calls Gemini, and stores recommendations in MongoDB.

#### Main Responsibilities

- listen to RabbitMQ activity events
- generate AI recommendations from activity data
- persist recommendation data
- serve recommendation queries by user or activity

#### Recommendation Fields

- `id`
- `activityId`
- `userId`
- `activityType`
- `recommendation`
- `improvements`
- `suggestions`
- `safety`
- `createdAt`

#### Endpoints

- `GET /fitness/recommendations/user/{userId}`
- `GET /fitness/recommendations/activity/{activityId}`

#### Environment Variables

- `GEMINI_API_URL`
- `GEMINI_API_KEY`

If Gemini parsing fails, the service falls back to a default recommendation.

## Frontend

The frontend is built with React and communicates with the gateway.

### Main Capabilities

- user signup through `POST /auth/register`
- login through Keycloak PKCE
- activity creation and listing
- activity detail view
- recommendation polling and display

### Dynamic Metrics in UI

- Running: `distance`, `pace`
- Cycling: `distance`, `avgSpeed`
- Weight training: `sets`, `reps`, `weight`

## End-to-End Flows

### Signup Flow

1. Frontend calls `POST /auth/register`.
2. Gateway creates user in Keycloak.
3. Gateway sets password.
4. Gateway syncs the user into `userservice`.
5. `userservice` stores the user profile.

### Login Flow

1. Frontend redirects to Keycloak.
2. User logs in.
3. Frontend receives the access token.
4. Token is stored locally and sent with API requests.

### Authenticated Request Flow

1. Frontend sends a bearer token to the gateway.
2. Gateway validates the token.
3. Gateway checks whether the user exists in `userservice`.
4. If missing, the gateway auto-registers the user.
5. Gateway injects `X-USER-ID`.
6. Gateway forwards the request.

### Activity Recommendation Flow

1. Frontend creates an activity.
2. Gateway forwards the request to `activityservice`.
3. `activityservice` validates the user and stores the activity.
4. `activityservice` publishes the activity to RabbitMQ.
5. `aiservice` consumes the message.
6. `aiservice` calls Gemini.
7. `aiservice` stores the recommendation.
8. Frontend polls until the recommendation becomes available.

## Local Setup Requirements

To run the full system locally, you need:

- MySQL
- MongoDB
- RabbitMQ
- Keycloak
- Java 17
- Node.js

### Required Infrastructure

- MySQL on `3306`
- MongoDB on `27017`
- RabbitMQ on `5672`
- Keycloak on `8181`

### Important Environment Variables

- `KEYCLOAK_ADMIN_USERNAME`
- `KEYCLOAK_ADMIN_PASSWORD`
- `GEMINI_API_URL`
- `GEMINI_API_KEY`

## Recommended Startup Order

1. Start MySQL, MongoDB, RabbitMQ, and Keycloak.
2. Start `configserver`.
3. Start `eureka`.
4. Start `userservice`.
5. Start `gateway`.
6. Start `activityservice`.
7. Start `aiservice`.
8. Start `fitness-microservice-frontend`.