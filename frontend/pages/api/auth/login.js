import axios from "axios";
// Fix the cookie import
const cookie = require("cookie");

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const response = await axios.post(
      "http://localhost:8000/api/token/",
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    // Check if we have the access token
    if (response.data?.access) {
      // Set cookie with the access token
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60 * 24 * 15, // 15 days
        sameSite: "Lax",
        path: "/",
      };

      res.setHeader(
        "Set-Cookie",
        cookie.serialize("access", response.data.access, cookieOptions)
      );

      return res.status(200).json({
        success: true,
        accessToken: response.data.access,
        refreshToken: response.data.refresh,
      });
    } else {
      throw new Error("No access token received from authentication server");
    }
  } catch (error) {
    console.error("Login error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Handle different types of errors
    if (error.response?.status === 401) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Unable to connect to authentication server",
      });
    }

    return res.status(500).json({
      error: "Authentication failed. Please try again.",
    });
  }
};
