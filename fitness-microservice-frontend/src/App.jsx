import { Box, Button, Paper, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from "react-router";
import { logout, setCredentials } from "./store/authSlice";
import ActivityForm from "./Components/ActivityForm";
import ActivityList from "./Components/ActivityList";
import ActivityDetail from "./Components/ActivityDetail";
import SignupForm from "./Components/SignupForm";

const ActivitiesPage = () => {
  return (<Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
    <ActivityForm  onActivitesAdded = {() => window.location.reload()} />
    <ActivityList />
  </Box>);
}

function App() {
  const { token, tokenData, logIn, logOut, isAuthenticated } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [authReady, setAuthReady] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const handleLogout = () => {
    dispatch(logout());
    logOut();
  };

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({token, user: tokenData}));
      setAuthReady(true);
    }
  }, [token, tokenData, dispatch]);

  return (
      <Router>
        {!token ? (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}>
          <Paper
            elevation={3}
            sx={{
              width: "100%",
              maxWidth: 480,
              p: 4,
              borderRadius: 2,
            }}>
            <Box sx={{textAlign: "center", mb: 4}}>
              <Typography variant="h4" gutterBottom>
                Welcome to Fitness App
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your activities, view your progress, and get AI-powered recommendations.
              </Typography>
            </Box>
            {showSignup ? (
              <>
                <SignupForm onSuccess={() => setShowSignup(false)} />
                <Button
                  sx={{mt: 2}}
                  fullWidth
                  variant="text"
                  onClick={() => setShowSignup(false)}>
                    Back to Login
                  </Button>
              </>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    logIn();
                  }}>
                    LOGIN
                  </Button>

                  <Button
                    sx={{mt: 2}}
                    fullWidth
                    variant="outlined"
                    onClick={() => setShowSignup(true)}>
                      SIGN UP
                    </Button>
              </>
            )}
          </Paper>
        </Box>
              ) : (
                <Box component="section" sx={{ p: 2 }}>
                  <Box sx={{display: "flex", justifyContent: "flex-end", mb: 2}}>
                    <Button variant="outlined" color="error" onClick={handleLogout}>
                      LOGOUT
                    </Button>
                  </Box>
                  
                  <Routes>
                    <Route path="/activities" element={<ActivitiesPage />} />
                    <Route path="/activities/:id" element={<ActivityDetail />} />
                    <Route path="/" element={token ?<Navigate to="/activities" replace /> : <div>Please login to view activities.</div>} />
                  </Routes>
                </Box>
              )}
      </Router>
    )
}

export default App;


