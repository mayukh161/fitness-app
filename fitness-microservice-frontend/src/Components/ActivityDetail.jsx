import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getActivityDetail, getActivityRecommendation } from "../services/api";
import { Alert, Box, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";

const ActivityDetail = () => {
    const {id} = useParams();
    const [activity, setActivity] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [recommendationLoading, setRecommendationLoading] = useState(true);
    const [recommendationError, setRecommendationError] = useState("");

    useEffect(() => {
        let isMounted = true;
        let timeoutId = null;
        let attempts = 0;

        const maxAttempts = 10;
        const pollInterval = 3000; // 3 seconds

        const fetchRecommendation = async () => {
            try {
                const response = await getActivityRecommendation(id);
                if (!isMounted) return;

                setRecommendation(response.data);
                setRecommendationLoading(false);
                setRecommendationError("");
            } catch (error) {
                if (!isMounted) return;

                attempts++;

                if (attempts < maxAttempts) {
                    timeoutId = setTimeout(fetchRecommendation, pollInterval);
                } else {
                    console.error("Recommendation is not available yet: ", error);
                    setRecommendation(null);
                    setRecommendationLoading(false);
                    setRecommendationError("Recommendation is still being generated. Please wait.");
                }
            }
        };

        const fetchActivity = async () => {
            try {
                const activityResponse = await getActivityDetail(id);
                if (!isMounted) return;

                setActivity(activityResponse.data);
                setRecommendationLoading(true);
                setRecommendationError("");
                fetchRecommendation();
            } catch (error) {
                console.error("Failed to load activity: ", error);
            }
        };

        fetchActivity();

        return () => {
            isMounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };

    }, [id]);
    
    
    if (!activity) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{maxWidth: 800, mx: 'auto', p: 2}}>
            <Typography variant="h5" gutterBottom>
                Activity Details
            </Typography>
            <Card sx={{mb: 2, boxShadow: 3}}>
                <CardContent>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Type:</strong> {activity.type}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Duration:</strong> {activity.duration} mins
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Calories:</strong> {activity.caloriesBurned}
                    </Typography>
                    <Typography sx={{ color: "gray" }}>
                        {new Date(activity.createdAt).toLocaleString()}
                    </Typography>
                </CardContent>
            </Card>

            {recommendationLoading && (
                <Card sx={{mb: 2, boxShadow: 3}}>
                    <CardContent sx={{display: "flex", alignItems: "center", gap: 2}}>
                        <CircularProgress size={24} />
                        <Typography>Generating your AI recommendation...</Typography>
                    </CardContent>
                </Card>
            )}

            {!recommendationLoading && recommendationError && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {recommendationError}
                </Alert>
            )}

            {recommendation && (
                <Card sx={{boxShadow: 3}}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>AI Recommendation</Typography>
                        <Typography variant="h6" sx={{fontWeight: "bold", mb: 1}}>
                            🧠 Analysis
                        </Typography>
                        <Typography paragraph sx={{backgroundColor: "#f5f5f5", p: 2, borderRadius: 2}}>
                            {recommendation.recommendation}
                        </Typography>

                        <Divider sx={{my: 2}} />

                        <Box sx={{mb: 3}}>
                            <Typography variant="h6">⚡ Improvements</Typography>
                            {recommendation?.improvements?.map((item, index) => (
                                <Typography 
                                    key={index} 
                                    sx={{
                                        mb: 1,
                                        pl: 1,
                                        borderLeft: "4px solid #1976d2"
                                    }}
                                >
                                    {item}
                                </Typography>
                            ))}
                        </Box>

                        <Divider sx={{my: 2}} />

                        <Box sx={{mb: 3}}>
                            <Typography variant="h6">💡 Suggestions</Typography>
                            {recommendation?.suggestions?.map((item, index) => (
                                <Typography 
                                    key={index} 
                                    sx={{
                                        mb: 1,
                                        pl: 1,
                                        borderLeft: "4px solid #1976d2"
                                    }}
                                >
                                    {item}
                                </Typography>
                            ))}
                        </Box>

                        <Divider sx={{my: 2}} />

                        <Box mb={3}>
                            <Typography variant="h6">🛡️ Safety Guidelines</Typography>
                            {recommendation?.safety?.map((item, index) => (
                                <Typography 
                                    key={index} 
                                    sx={{
                                        mb: 1,
                                        pl: 1,
                                        borderLeft: "4px solid #1976d2"
                                    }}
                                >
                                    {item}
                                </Typography>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    )
}

export default ActivityDetail;