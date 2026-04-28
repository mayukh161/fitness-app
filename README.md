Fitness App
Overview
This project is a fitness tracking platform built with microservices.

Modules:

configserver: centralized configuration
eureka: service discovery
gateway: API gateway, JWT validation, Keycloak integration
userservice: user profile service with MySQL
activityservice: activity tracking service with MongoDB
aiservice: AI recommendation service with MongoDB and RabbitMQ
fitness-microservice-frontend: React frontend
Main flow:

User signs up through the gateway.
Gateway creates the user in Keycloak.
Gateway stores or syncs the user in userservice.
User logs in through Keycloak using OAuth2 PKCE.
Frontend sends bearer token to gateway.
Gateway validates JWT and forwards request to services.
User creates an activity.
activityservice saves it and publishes an event to RabbitMQ.
aiservice consumes the event, calls Gemini, and stores recommendation.
Frontend polls and shows the recommendation.
Tech Stack
Java 17
Spring Boot 4.0.5
Spring Cloud 2025.1.1
Eureka
Config Server
Spring Cloud Gateway
Spring Security OAuth2 Resource Server
MySQL
MongoDB
RabbitMQ
Keycloak
React + Vite
Material UI
Redux Toolkit
Ports
Config Server: 8888
Eureka: 8761
Gateway: 8080
User Service: 8081
Activity Service: 8082
AI Service: 8083
Frontend: 5173
Keycloak: 8181
Databases and Messaging
MySQL DB: fitness_user
MongoDB DB: fitness_activity
MongoDB DB: fitness_recommendation
RabbitMQ exchange: fitness.exchange
RabbitMQ queue: activity.queue
RabbitMQ routing key: activity.tracking
Config Server
Config server uses native config and loads files from:

classpath:/config
Config files found:

user-service.yml
activity-service.yml
ai-service.yml
gateway.yml
Each service uses spring.application.name matching these config names.

Eureka
All business services register with:

http://localhost:8761/eureka/
Gateway
Responsibilities:

routes requests to services
validates Keycloak JWT
exposes signup endpoint
injects X-USER-ID into downstream requests
auto-syncs users into userservice
Routes:

/fitness/users/** -> USER-SERVICE
/fitness/activities/** -> ACTIVITY-SERVICE
/fitness/recommendations/** -> AI-SERVICE
Public endpoint:

POST /auth/register
All other endpoints require authentication.

Keycloak / Auth Flow
Frontend uses OAuth2 Authorization Code with PKCE.

Keycloak realm:

fitness-oauth2
Frontend client id:

oauth2-pkce-client
Gateway validates JWT using Keycloak JWK endpoint.

Gateway also uses Keycloak admin API to:

create user
set password
return Keycloak user id
send synced user profile to userservice
On authenticated requests, gateway filter:

reads JWT subject
checks if user exists in userservice
creates user if missing
injects X-USER-ID
User Service
Purpose:

store user profile data in MySQL
Entity fields:

id
email
keycloakId
password
firstname
lastname
role
createdAt
updatedAt
Endpoints:

GET /fitness/users/{userId}: get profile by Keycloak ID
POST /fitness/users/register: create or sync user
GET /fitness/users/{userId}/validate: validate user existence
Notes:

if email already exists, existing user is returned
if keycloakId is missing on existing user, it gets updated
password is still stored, but auth is handled by Keycloak
Activity Service
Purpose:

store user activities in MongoDB
publish activity events to RabbitMQ
Activity fields:

id
userId
type
duration
caloriesBurned
startTime
additionalMetrics
createdAt
updatedAt
Supported types:

RUNNING
WALKING
CYCLING
SWIMMING
WEIGHT_TRAINING
YOGA
CARDIO
STRETCHING
OTHER
Endpoints:

POST /fitness/activities
GET /fitness/activities
GET /fitness/activities/{activityId}
DELETE /fitness/activities/{activityId}
Behavior:

validates X-USER-ID by calling userservice
saves activity
publishes saved activity to RabbitMQ
Example request:

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
Important note:

delete endpoint currently does not verify ownership
AI Service
Purpose:

consume activity events
call Gemini
generate and store recommendations
Recommendation fields:

id
activityId
userId
activityType
recommendation
improvements
suggestions
safety
createdAt
Endpoints:

GET /fitness/recommendations/user/{userId}
GET /fitness/recommendations/activity/{activityId}
Behavior:

consumes from activity.queue
generates recommendation from activity data
stores result in MongoDB
Gemini config uses:

GEMINI_API_URL
GEMINI_API_KEY
If parsing fails, service creates a fallback recommendation.

Frontend
Tech:

React
Vite
Material UI
Redux Toolkit
Axios
React Router
react-oauth2-code-pkce
Frontend behavior:

signup calls POST /auth/register
login uses Keycloak PKCE
stores token and user info in localStorage
sends bearer token on API calls
activity detail page polls for recommendation
Main screens:

login/signup
activity list
add activity
activity detail with AI recommendation
Dynamic metrics supported in UI:

Running: distance, pace
Cycling: distance, avgSpeed
Weight training: sets, reps, weight
End-to-End Flow
Signup
Frontend calls gateway /auth/register
Gateway creates user in Keycloak
Gateway sets password
Gateway sends profile to userservice
userservice stores user
Login
Frontend redirects to Keycloak
User logs in
Frontend receives token
Token stored locally
First authenticated request
Frontend sends bearer token
Gateway validates token
Gateway checks if user exists in userservice
If missing, gateway auto-registers user
Gateway injects X-USER-ID
Request forwarded
Activity to recommendation
Frontend creates activity
Gateway forwards to activityservice
activityservice validates user
Activity saved in MongoDB
Activity published to RabbitMQ
aiservice consumes message
aiservice calls Gemini
Recommendation saved
Frontend polls and displays result