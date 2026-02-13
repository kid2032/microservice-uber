import axios from "axios";

export async function checkAuth() {
  try {
    const res = await axios.get(
      "http://localhost:8000/user/check-auth",
      { withCredentials: true }
    );

    return {
      isAuth: true,
      user: res.data, // or res.data if that’s your API
    };
  } catch (err) {
    return {
      isAuth: false,
      user: null,
    };
  }
}
