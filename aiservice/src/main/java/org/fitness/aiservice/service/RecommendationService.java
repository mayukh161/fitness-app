package org.fitness.aiservice.service;

import lombok.RequiredArgsConstructor;
import org.fitness.aiservice.model.Recommendation;
import org.fitness.aiservice.repo.RecommendationRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {
    private final RecommendationRepo recommendationRepo;

    public List<Recommendation> getUserRecommendation(String userId) {
        return recommendationRepo.findByUserId(userId);
    }

    public Recommendation getActivityRecommendation(String authenticatedUserId, String activityId) {
        Recommendation recommendation = recommendationRepo.findByActivityId(activityId)
                .orElseThrow(() -> new RuntimeException("No recommendation found for this activity: " +  activityId));

        if (!recommendation.getUserId().equals(authenticatedUserId)) {
            throw new RuntimeException("You are not authorized to view this recommendation");
        }

        return recommendation;
    }
}
