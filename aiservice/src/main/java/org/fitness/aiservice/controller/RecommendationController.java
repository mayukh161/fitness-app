package org.fitness.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.fitness.aiservice.model.Recommendation;
import org.fitness.aiservice.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/fitness/recommendations")
public class RecommendationController {
    private final RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Recommendation>> getUserRecommendation(
            @RequestHeader("X-USER-ID") String authenticatedUserId,
            @PathVariable String userId) {
        if (!authenticatedUserId.equals(userId)) {
            throw new RuntimeException("You are not authorized to view these recommendations");
        }

        return ResponseEntity.ok(recommendationService.getUserRecommendation(userId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<Recommendation> getActivityRecommendation(
            @RequestHeader("X-USER-ID") String authenticatedUserId,
            @PathVariable String activityId) {
        return ResponseEntity.ok(recommendationService.getActivityRecommendation(authenticatedUserId, activityId));
    }
}
