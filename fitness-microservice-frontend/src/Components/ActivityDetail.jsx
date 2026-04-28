import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getActivityDetail, getActivityRecommendation } from "../services/api";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";

const ActivityDetail = () => {
    const {id} = useParams();
    const [activity, setActivity] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        const fetchActivityDetail = async () => {
            try {
                const activityResponse = await getActivityDetail(id);
                setActivity(activityResponse.data);
            } catch (error) {
                console.error("Failed to load activity:", error);
                return;
            }

            try {
                const recommendationResponse = await getActivityRecommendation(id);
                setRecommendation(recommendationResponse.data);
            } catch (error) {
                console.error("Recommendation is not available yet:", error);
                setRecommendation(null);
            }
        }

        fetchActivityDetail();

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