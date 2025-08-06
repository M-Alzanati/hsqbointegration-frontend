const axios = require("axios");

exports.main = async (context = {}) => {
  const { userId } = context.parameters;

  if (!userId) {
    console.log("User ID is required");
    return { data: { isConnected: false, message: "User ID is required" } };
  }

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.log("Backend URL is required");
    return { data: { isConnected: false, message: "Backend URL is required" } };
  }

  const checkConnectionUrl = `${backendUrl}/quickbooks/checkConnection?userId=${userId}`;
  console.log("Checking QuickBooks connection:", checkConnectionUrl);
  
  return axios
    .get(checkConnectionUrl, {
      headers: {
        "x-api-key": process.env.BACKEND_API_KEY,
      },
    })
    .then((response) => {
      const { data } = response;

      if (data?.data?.connected) {
        console.log("✅ QuickBooks connection is active for user:", userId);
      }

      return { data: data?.data };
    })
    .catch((error) => {
      console.error("Error creating QuickBooks connection:", error);
      return {
        data: {
          isConnected: false,
          message: "Failed to create QuickBooks connection",
        },
      };
    });
};
