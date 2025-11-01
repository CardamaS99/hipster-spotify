// server.js
import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/token", async (req, res) => {
  const { code } = req.body;

  const auth = Buffer.from(
    `${process.env.VITE_SPOTIFY_CLIENT_ID}:${process.env.VITE_SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  console.log("Exchanging code for token:", code);

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.VITE_SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log(response.data);

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to exchange code" });
  }
});

app.post("/api/refresh", async (req, res) => {
  const { refresh_token } = req.body;

  const auth = Buffer.from(
    `${process.env.VITE_SPOTIFY_CLIENT_ID}:${process.env.VITE_SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  console.log("Refreshing token");

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token refreshed successfully");

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));


