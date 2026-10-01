const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

async function run() {
  try {
    const login = await axios.post(
      `${BASE_URL}/auth/login`,
      {
        email: "admin@marketplace.com",
        password: "Admin@123"
      }
    );

    const token = login.data.token;

    const response = await axios.put(
      `${BASE_URL}/admin/users/5/activate`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log("Activate Vendor 2 Status:", response.status);
    console.log(response.data);

  } catch (error) {
    console.error("Failed:");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

run();