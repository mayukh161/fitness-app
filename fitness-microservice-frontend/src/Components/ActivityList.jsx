import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getActivities } from "../services/api";
import { deleteActivity } from "../services/api";

const ActivityList = () => {
    const [activities, setActivities] = useState([]);
    const navigate = useNavigate();
    const [deletingId, setDeletingId] = useState(null);

    const fetchActivities = async () => {
        try {
            const response = await getActivities();
            setActivities(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
        if (!confirmDelete) return;

        try {
            setDeletingId(id);
            await deleteActivity(id);
            fetchActivities();
        } catch (error) {
            console.error(error);
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div>
            <Grid container spacing={2}>
                {activities.map((activity) => (
                    <Grid item xs={12} sm={6} md={4} key={activity.id}>
                        <Card 
                            sx={{cursor: "pointer",
                                "&:hover": {
                                    transform: "scale(1.02)",
                                    transition: "0.2s"
                                }
                            }}
                            onClick={() => navigate(`/activities/${activity.id}`)}>
                            <CardContent sx={{display: "flex", flexDirection: "column", gap: 1}}>
                                <Typography variant='h6'>{activity.type}</Typography>
                                <Typography>
                                    Duration: {activity.duration}
                                </Typography>
                                <Typography>
                                    Calories Burned: {activity.caloriesBurned}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    sx={{mt: 1}}
                                    disabled={deletingId === activity.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(activity.id);
                                    }}
                                    >
                                        {deletingId === activity.id ? "Deleting..." : "Delete"}
                                    </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default ActivityList;