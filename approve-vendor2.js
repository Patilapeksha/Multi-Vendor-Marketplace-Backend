const http = require("http");

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5000,
      path,
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            body: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            body
          });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function run() {
  try {
    console.log("Logging in as Admin...");

    const login = await request(
      "POST",
      "/api/auth/login",
      {
        email: "admin@marketplace.com",
        password: "Admin@123"
      }
    );

    console.log("Login Status:", login.status);

    if (login.status !== 200) {
      console.log("Login Failed:", login.body);
      return;
    }

    const token = login.body.token;

    console.log("Admin Login Successful");

    console.log("\nApproving Vendor 2...");

    const update = await request(
      "PUT",
      "/api/admin/vendors/2/status",
      {
        status: "approved"
      },
      token
    );

    console.log(
      "Update Vendor Status:",
      update.status
    );

    console.log(
      "Update Response:",
      update.body
    );

    if (update.status === 200) {
      console.log(
        "\nSUCCESS: Vendor 2 approved successfully."
      );
    } else {
      console.log(
        "\nVendor approval failed."
      );
    }

  } catch (error) {
    console.error(
      "\nTest failed:",
      error.message
    );
  }
}

run();