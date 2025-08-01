const axios = require("axios");

exports.main = async (context = {}) => {
  const { dealId } = context.parameters;
  const backendUrl = process.env.BACKEND_API_URL;

  console.log("Retrieving contacts for deal:", dealId);

  if (!dealId) {
    console.log("Deal ID is required");
    return { data: { isConnected: false, message: "Deal ID is required" } };
  }

  if (!backendUrl) {
    console.log("Backend URL is required");
    return { data: { isConnected: false, message: "Backend URL is required" } };
  }

  const getDealContactsUrl = `${backendUrl}/hubspot/associated-contacts/${dealId}`;
  console.log("Get Deal Contacts URL:", getDealContactsUrl);

  return axios
    .get(getDealContactsUrl, {
      headers: {
        "x-api-key": process.env.BACKEND_API_KEY,
      },
    })
    .then((response) => {
      if (!response.data || !response.data?.data) {
        return { data: { contacts: [] } };
      }

      console.log("Contacts retrieved successfully");

      const { data } = response;
      return { data: { contacts: data?.data } };
    })
    .catch((error) => {
      console.error("Error retrieving contact list:", error);
      return {
        data: {
          isConnected: false,
          message: "Failed to retrieve contact list",
        },
      };
    });
};
