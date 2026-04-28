import { useState } from "react"
import { registerUser } from "../services/api";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";


const SignupForm = ({ onSuccess }) => {
    const [form, setForm] = useState({
        username: '',
        email: "",
        password: "",
        firstname: "",
        lastname: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        })); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            await registerUser(form);
            setSuccess("Signup successful")
            setForm({
                username: '',
                email: "",
                password: "",
                firstname: "",
                lastname: ""
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            setError("Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 420, mx: "auto", p: 0 }}>
            <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}

                <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="First Name"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <TextField
                    label="Last Name"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    fullWidth
                />

                <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Creating..." : "Sign Up"}
                </Button>
            </Stack>
        </Box>
    );
};

export default SignupForm;