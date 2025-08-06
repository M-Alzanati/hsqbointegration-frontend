const axios = require("axios");

exports.main = async (context = {}) => {
  const { dealId, userId } = context.parameters;
  const backendUrl = process.env.BACKEND_API_URL;

  console.log("Retrieving invoice list for user:", userId, "and deal:", dealId);

  if (!dealId) {
    console.log("Deal ID is required");
    return { data: { isConnected: false, message: "Deal ID is required" } };
  }

  if (!userId) {
    console.log("User ID is required");
    return { data: { isConnected: false, message: "User ID is required" } };
  }

  if (!backendUrl) {
    console.log("Backend URL is required");
    return { data: { isConnected: false, message: "Backend URL is required" } };
  }

  const getUserInvoiceListUrl = `${backendUrl}/invoice/deals/${dealId}?&userId=${userId}`;
  console.log("Get User Invoice List URL:", getUserInvoiceListUrl);

  return axios
    .get(getUserInvoiceListUrl, {
      headers: {
        "x-api-key": process.env.BACKEND_API_KEY,
      },
    })
    .then((response) => {
      if (!response.data || !response.data?.data) {
        return { data: { contacts: [] } };
      }

      console.log("Invoice List retrieved successfully");
      if (!response.data?.data) {
        return { data: { invoices: [] } };
      }

      if (!Array.isArray(response.data.data)) {
        console.error("Invalid invoice list format");
        return { data: { invoices: [] } };
      }
      console.log("Invoice List:", response.data.data);

      const { data } = response;
      return { data: { invoices: data?.data } };
    })
    .catch((error) => {
      console.error("Error retrieving invoice list:", error);
      return {
        data: {
          isConnected: false,
          message: "Failed to retrieve invoice list",
        },
      };
    });
};
