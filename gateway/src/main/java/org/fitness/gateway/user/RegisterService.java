package org.fitness.gateway.user;

import lombok.RequiredArgsConstructor;
import org.fitness.gateway.keycloak.KeycloakAdminService;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class RegisterService {
    private final UserService userService;
    private final KeycloakAdminService keycloakAdminService;

    public Mono<UserResponse> register(RegisterRequest registerRequest) {
        return keycloakAdminService.createUser(registerRequest)
                .flatMap(keycloakId -> {
                    String rawPassword = registerRequest.getPassword();
                    registerRequest.setKeycloakId(keycloakId);

                    return keycloakAdminService.setPassword(keycloakId, rawPassword)
                            .then(Mono.fromSupplier(() -> {
                                registerRequest.setPassword("KEYCLOAK_MANAGED");
                                return registerRequest;
                            }))
                            .flatMap(userService::registerUser);
                });
    }
}
