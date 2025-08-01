const axios = require("axios");

exports.main = async (context = {}) => {
  const { userId, dealId, contactId } = context.parameters;
  const backendUrl = process.env.BACKEND_API_URL;

  console.log("Creating Invoice for user:", userId);

  if (!userId) {
    console.log("User ID is required");
    return { data: { isConnected: false, message: "User ID is required" } };
  }

  if (!dealId) {
    console.log("Deal ID is required");
    return { data: { isConnected: false, message: "Deal ID is required" } };
  }

  if (!contactId) {
    console.log("Contact ID is required");
    return { data: { isConnected: false, message: "Contact ID is required" } };
  }

  if (!backendUrl) {
    console.log("Backend URL is required");
    return { data: { isConnected: false, message: "Backend URL is required" } };
  }

  const createInvoiceUrl = `${backendUrl}/invoice/create-invoice?userId=${userId}&dealId=${dealId}&contactId=${contactId}`;

  return axios
    .post(
      createInvoiceUrl,
      {},
      {
        headers: {
          "x-api-key": process.env.BACKEND_API_KEY,
        },
      }
    )
    .then((response) => {
      const { data } = response;
      if (!data || !data?.data) {
        return { data: { isConnected: false, message: "No data returned" } };
      }
      console.log("Invoice created successfully");

      const invoiceNumber = data?.data?.invoiceNumber;
      const invoiceUrl = data?.data?.invoiceUrl;

      return { data: { invoiceNumber, invoiceUrl } };
    })
    .catch((error) => {
      console.log(
        "Error creating invoice:",
        error.response?.data?.error || error.message
      );
      return {
        data: {
          isConnected: false,
          message: "Failed to create QuickBooks connection",
        },
      };
    });
};
