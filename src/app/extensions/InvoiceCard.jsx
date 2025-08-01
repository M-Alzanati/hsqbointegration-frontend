import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Text,
  Image,
  Box,
  hubspot,
  Flex,
  StatusTag,
  LoadingSpinner,
  Dropdown,
  Link,
} from "@hubspot/ui-extensions";

const InvoiceCard = ({ context }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [authUrl, setAuthUrl] = useState("");
  const [contacts, setContacts] = useState(
    context.associations?.contacts || []
  );
  const [selectedContactId, setSelectedContactId] = useState(
    contacts[0]?.id || ""
  );
  const [invoiceUrl, setInvoiceUrl] = useState("");

  useEffect(() => {
    setSelectedContactId(contacts[0]?.id || "");

    let isMounted = true;
    let intervalId;
    let pollingInterval = 5000;

    const checkConnection = async () => {
      try {
        const userId = context.user.id;
        const response = await hubspot.serverless("checkConnection", {
          parameters: { userId: userId },
        });

        if (!isMounted) {
          return;
        }

        if (!response || !response.data) {
          setError("No response from serverless function to check connection");
          setIsConnected(false);
          setIsConnecting(false); // Hide spinner on error
          return;
        }

        if (response.data.connected) {
          setIsConnected(true);

          // If connected, increase polling interval to 10 minutes
          if (pollingInterval !== 600000) {
            pollingInterval = 600000;
            clearInterval(intervalId);
            intervalId = setInterval(checkConnection, pollingInterval);
          }
        } else {
          setIsConnected(false);

          // If not connected, keep polling at 5s
          if (pollingInterval !== 5000) {
            pollingInterval = 5000;
            clearInterval(intervalId);
            intervalId = setInterval(checkConnection, pollingInterval);
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setError("Failed to connect to QuickBooks");
        setIsConnected(false);
        setIsConnecting(false); // Hide spinner on error
      }
    };

    const getContacts = async () => {
      try {
        setIsLoading(true);
        setLoadingLabel("Retrieving contacts...");

        const dealId = context.crm?.objectId || context.objectId;
        const response = await hubspot.serverless("getContacts", {
          parameters: {
            dealId: dealId,
          },
        });

        if (!isMounted) {
          return;
        }

        if (!response || !response.data) {
          setError("No response from serverless function to get contacts");
          setIsLoading(false);
          return;
        }

        setContacts(response.data?.contacts || []);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Error retrieving contacts:", error);
        setError("Failed to retrieve contacts");
        setIsLoading(false);
        setContacts([]);
      }
    };

    const fetchAuthUrl = async () => {
      try {
        setIsLoading(true);
        setLoadingLabel("Fetching authentication URL...");

        const userId = context.user.id;
        const response = await hubspot.serverless("checkConnection", {
          parameters: { userId: userId },
        });

        if (response.data?.authUrl) {
          setAuthUrl(response.data.authUrl);
        } else {
          setError("Failed to retrieve authentication URL");
        }
      } catch (error) {
        console.error("Error fetching auth URL:", error);
        setError("Failed to retrieve authentication URL");
      } finally {
        setIsLoading(false);
        setLoadingLabel("");
      }
    };

    fetchAuthUrl()
      .then(() => {
        getContacts();
        checkConnection();
      })
      .catch(() => {
        setIsLoading(false);
      });

    intervalId = setInterval(checkConnection, pollingInterval);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [context.user.id]);

  const handleCreateInvoice = async () => {
    const userId = context.user.id;
    const dealId = context.crm?.objectId || context.objectId;
    const contactId = selectedContactId;

    if (!contactId) {
      setError("No contact selected for this deal");
      return;
    }

    if (!userId || !dealId) {
      setError("User ID and Deal ID are required");
      return;
    }

    setIsLoading(true);
    setLoadingLabel("Creating invoice...");

    try {
      const response = await hubspot.serverless("createInvoice", {
        parameters: { userId, dealId, contactId: selectedContactId },
      });

      if (response.data.invoiceUrl) {
        setStatus(
          `Invoice ${response.data.invoiceNumber} created successfully`
        );
        setInvoiceUrl(response.data.invoiceUrl);
        setError("");
      } else {
        setError("Failed to create invoice");
      }
    } catch (error) {
      setError("Error: " + error.message);
    } finally {
      setIsLoading(false);
      setLoadingLabel("");
    }
  };

  return (
    <Flex direction={"column"} wrap={"wrap"} gap={"small"}>
      <Box>
        <Image
          src="https://146593394.fs1.hubspotusercontent-eu1.net/hubfs/146593394/download.svg"
          alt="QuickBooks Icon"
          width={40}
          height={40}
        />
        <Text format={{ fontWeight: "bold" }} variant="bodytext">
          {" "}
          Create and manage QuickBooks invoices directly from your HubSpot deal.
        </Text>
      </Box>

      {isLoading && (
        <LoadingSpinner label={loadingLabel} showLabel={true} size="small" />
      )}

      {isConnecting && (
        <LoadingSpinner
          label="Connecting to QuickBooks..."
          showLabel={true}
          size="small"
        />
      )}

      <Flex direction={"column"} wrap={"wrap"} gap={"small"}>
        {authUrl && !isConnected && (
          <>
            <Link
              href={{
                url: authUrl,
                external: true,
              }}
              variant="dark"
            >
              Connect With QuickBooks
            </Link>
          </>
        )}
        {contacts.length > 0 && (
          <Dropdown
            options={contacts.map((contact) => ({
              label: `${contact.firstname || ""} ${contact.lastname || ""} (${
                contact.email || contact.id
              })`,
              value: contact.id,
              onClick: () => {
                setSelectedContactId(contact.id);
              },
            }))}
            disabled={!isConnected}
            variant="primary"
            buttonSize="md"
            buttonText={(() => {
              if (!selectedContactId) return "Select Contact";
              const selected = contacts.find((c) => c.id === selectedContactId);

              if (!selected) return "Select Contact";
              return `${selected.firstname || ""} ${selected.lastname || ""} (${
                selected.email || selected.id
              })`;
            })()}
          />
        )}
        {isConnected && (
          <Button
            onClick={handleCreateInvoice}
            disabled={isLoading || !selectedContactId}
          >
            {isLoading ? "Creating Invoice..." : "Create Invoice"}
          </Button>
        )}
        <Box>
          {invoiceUrl && (
            <Text format={{ fontWeight: "bold" }}>
              Invoice URL:{" "}
              <Link
                href={{
                  url: invoiceUrl,
                  external: true,
                }}
              >
                {invoiceUrl}
              </Link>
            </Text>
          )}
        </Box>

        {!authUrl && !isConnected && (
          <Text format={{ fontWeight: "bold" }}>
            Support:{" "}
            <StatusTag variant="danger">
              Something wrong, check with your admin
            </StatusTag>
          </Text>
        )}
        {!isConnected && (
          <Text format={{ fontWeight: "bold" }}>
            <StatusTag variant="danger">Not Connected To QuickBooks</StatusTag>
          </Text>
        )}
        {status && isConnected && (
          <Text format={{ fontWeight: "bold" }}>
            <StatusTag variant="success">{status}</StatusTag>
          </Text>
        )}
        {error && (
          <Text format={{ fontWeight: "bold" }}>
            <StatusTag variant="danger">{error}</StatusTag>
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

hubspot.extend(({ context }) => <InvoiceCard context={context} />);
