import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import React, { useState } from "react";
import { addActivity } from "../services/api";



const ActivityForm = ({ onActivitesAdded }) => {
    const [activity, setActivity] = useState({
        type: "RUNNING", 
        duration: '', 
        caloriesBurned: '',
        additionalMetrics: {}
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!activity.duration || !activity.caloriesBurned) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            await addActivity(activity);
            onActivitesAdded();
            setActivity({ 
                type: "RUNNING", 
                duration: '', 
                caloriesBurned: '',
                additionalMetrics: {}
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div>
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                
                <FormControl fullWidth sx={{ mb: 2 }} variant="outlined">
                    <InputLabel shrink>Activity Type</InputLabel>
                    <Select value={activity.type}
                    onChange={(e) => setActivity({...activity, type: e.target.value, additionalMetrics: {}})}>
                        <MenuItem value="RUNNING">Running</MenuItem>
                        <MenuItem value="WALKING">Walking</MenuItem>
                        <MenuItem value="CYCLING">Cycling</MenuItem>
                        <MenuItem value="SWIMMING">Swimming</MenuItem>
                        <MenuItem value="WEIGHT_TRAINING">Weight Training</MenuItem>
                        <MenuItem value="YOGA">Yoga</MenuItem>
                        <MenuItem value="CARDIO">Cardio</MenuItem>
                        <MenuItem value="STRETCHING">Stretching</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth
                            required
                            label="Duration (Minutes)"
                            type='number'
                            sx={{ mb: 2 }}
                            value={activity.duration}
                            onChange={(e) => setActivity({...activity, duration: e.target.value})}/>

                <TextField fullWidth
                            required
                            label="Calories Burned"
                            type='number'
                            sx={{ mb: 2 }}
                            value={activity.caloriesBurned}
                            onChange={(e) => setActivity({...activity, caloriesBurned: e.target.value})}/>
                {activity.type === "RUNNING" && (
                    <>
                        <TextField 
                            fullWidth
                            label="Distance (km)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.distance || ""}
                            onChange={(e) => 
                                setActivity({
                                    ...activity, 
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        distance: e.target.value
                                        }
                                    })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Pace (min/km)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.pace || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        pace: e.target.value
                                    }
                                })
                            }
                        />
                    </>
                    
                )}

                {activity.type === "CYCLING" && (
                    <>
                        <TextField
                            fullWidth
                            label="Distance (km)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.distance || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        distance: e.target.value
                                    }
                                })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Average Speed (km/h)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.avgSpeed || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        avgSpeed: e.target.value
                                    }
                                })
                            }
                        />
                    </>
                )}

                {activity.type === "WEIGHT_TRAINING" && (
                    <>
                        <TextField
                            fullWidth
                            label="Sets"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.sets || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        sets: e.target.value
                                    }
                                })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Reps"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.reps || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        reps: e.target.value
                                    }
                                })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Weight (kg)"
                            type="number"
                            sx={{ mb: 2 }}
                            value={activity.additionalMetrics.weight || ""}
                            onChange={(e) =>
                                setActivity({
                                    ...activity,
                                    additionalMetrics: {
                                        ...activity.additionalMetrics,
                                        weight: e.target.value
                                    }
                                })
                            }
                        />
                    </>
                )}
                <Button type="submit" variant="contained" color="primary">Add Activity</Button>
            </Box>
        </div>
    )
}

export default ActivityForm;