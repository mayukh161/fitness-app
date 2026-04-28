package org.fitness.gateway.keycloak;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.fitness.gateway.user.RegisterRequest;
import org.fitness.gateway.user.UserService;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class KeycloakUserSyncFilter implements WebFilter {
    private final UserService userService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        if ("/fitness/users/register".equals(path) || "/auth/register".equals(path)) {
            return chain.filter(exchange);
        }

        return exchange.getPrincipal()
                .cast(JwtAuthenticationToken.class)
                .flatMap(authentication -> {
                    String userId = authentication.getToken().getSubject();

                    RegisterRequest registerRequest = new RegisterRequest();
                    registerRequest.setEmail(authentication.getToken().getClaimAsString("email"));
                    registerRequest.setPassword("KEYCLOAK_MANAGED");
                    registerRequest.setKeycloakId(userId);
                    registerRequest.setFirstname(authentication.getToken().getClaimAsString("given_name"));
                    registerRequest.setLastname(authentication.getToken().getClaimAsString("family_name"));

                    return userService.validateUser(userId)
                            .flatMap(exists -> {
                                if (!exists) {
                                    return userService.registerUser(registerRequest).then(Mono.empty());
                                }
                                return Mono.empty();
                            })
                            .then(Mono.defer(() -> {
                                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                                        .header("X-USER-ID", userId)
                                        .build();
                                return chain.filter(exchange.mutate().request(mutatedRequest).build());
                            }));
                })
                .switchIfEmpty(chain.filter(exchange));
    }
}
