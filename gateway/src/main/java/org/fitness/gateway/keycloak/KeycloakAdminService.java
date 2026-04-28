package org.fitness.gateway.keycloak;

import lombok.RequiredArgsConstructor;
import org.fitness.gateway.user.RegisterRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {
    private final WebClient keycloakAdminWebClient;
    private final KeycloakAdminProperties keycloakAdminProperties;

    public KeycloakAdminService(
            @Qualifier("keycloakAdminWebClient")WebClient keycloakAdminWebClient,
            KeycloakAdminProperties keycloakAdminProperties) {
        this.keycloakAdminWebClient = keycloakAdminWebClient;
        this.keycloakAdminProperties = keycloakAdminProperties;
    }

    public Mono<String> getAdminAccessToken() {
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", "password");
        formData.add("client_id", keycloakAdminProperties.getClientId());
        formData.add("username", keycloakAdminProperties.getUsername());
        formData.add("password", keycloakAdminProperties.getPassword());

        return keycloakAdminWebClient.post()
                .uri(keycloakAdminProperties.getServerUrl()
                + "/realms/master/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue(formData)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("access_token"));
    }

    public Mono<String> createUser(RegisterRequest registerRequest) {
        return getAdminAccessToken().flatMap(token ->
                keycloakAdminWebClient.post()
                        .uri(keycloakAdminProperties.getServerUrl()
                        + "/admin/realms/" + keycloakAdminProperties.getRealm() + "/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of(
                                "username", registerRequest.getUsername(),
                                "email", registerRequest.getEmail(),
                                "firstName", registerRequest.getFirstname(),
                                "lastName", registerRequest.getLastname(),
                                "enabled", true
                        ))
                        .retrieve()
                        .toBodilessEntity()
                        .map(response -> {
                            List<String> locations = response.getHeaders().get("Location");
                            if (locations == null || locations.isEmpty()) {
                                throw new RuntimeException("Keycloak user created but Location header is missing");
                            }
                            String location = locations.get(0);
                            return location.substring(location.lastIndexOf("/") + 1);
                        })
        );
    }

    public Mono<Void> setPassword(String userId, String password) {
        return getAdminAccessToken().flatMap(token ->
                keycloakAdminWebClient.put()
                        .uri(keycloakAdminProperties.getServerUrl()
                        + "/admin/realms/" + keycloakAdminProperties.getRealm()
                        + "/users/" + userId + "/reset-password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of(
                                "type", "password",
                                "temporary", false,
                                "value", password
                        ))
                        .retrieve()
                        .toBodilessEntity()
                        .then()
        );
    }
}
