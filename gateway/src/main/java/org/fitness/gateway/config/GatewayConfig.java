package org.fitness.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service", route -> route
                        .path("/fitness/users/**")
                        .uri("lb://USER-SERVICE"))
                .route("activity-service", route -> route
                        .path("/fitness/activities/**")
                        .uri("lb://ACTIVITY-SERVICE"))
                .route("ai-service", route -> route
                        .path("/fitness/recommendations/**")
                        .uri("lb://AI-SERVICE"))
                .build();
    }
}
