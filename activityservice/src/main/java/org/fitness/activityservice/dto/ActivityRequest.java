package org.fitness.activityservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.fitness.activityservice.model.ActivityType;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ActivityRequest {
    private ActivityType type;

    @NotBlank(message = "Duration is required")
    private Integer duration;

    @NotBlank(message = "Calories burned is required")
    private Integer caloriesBurned;

    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;
}
