import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  LoadingSpinner,
  StatusTag,
  Link,
  hubspot,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Flex,
  TableFooter,
} from "@hubspot/ui-extensions";

const InvoiceList = ({ userId, dealId }) => {
  const [invoices, setInvoices] = useState([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate pagination values after invoices state is set
  const totalPages = React.useMemo(
    () => Math.ceil(invoices.length / itemsPerPage),
    [invoices, itemsPerPage]
  );
  const paginatedInvoices = React.useMemo(
    () => invoices.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [invoices, page, itemsPerPage]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId || !dealId) return;
    setIsLoading(true);
    setError("");
    const fetchInvoices = async () => {
      try {
        const response = await hubspot.serverless("getInvoiceList", {
          parameters: { dealId, userId },
        });
        const data = await response.data;
        setInvoices(data?.invoices || []);
      } catch (err) {
        setError("Failed to fetch invoices");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, [userId, dealId]);

  return (
    <Box>
      <Text format={{ fontWeight: "bold" }}>Invoices: </Text>
      {isLoading && (
        <LoadingSpinner
          label="Loading invoices..."
          showLabel={true}
          size="small"
        />
      )}
      {error && (
        <Text format={{ fontWeight: "bold" }}>
          <StatusTag variant="danger">{error}</StatusTag>
        </Text>
      )}
      {invoices.length === 0 && !isLoading && !error && (
        <Text>No invoices found for this user.</Text>
      )}
      {invoices.length > 0 && (
        <>
          <Table bordered={true} flush={true}>
            <TableHead>
              <TableRow>
                <TableHeader width="min">Invoice #</TableHeader>
                <TableHeader width="min">View</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice.invoiceNumber}>
                  <TableCell width="min">{invoice.invoiceNumber}</TableCell>
                  <TableCell width="min">
                    {invoice.invoiceUrl ? (
                      <Link href={{ url: invoice.invoiceUrl, external: true }}>
                        View
                      </Link>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell width="min">
                  <Button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    variant="secondary"
                    size="sm"
                  >
                    Previous
                  </Button>
                </TableCell>
                <TableCell width="min" style={{ textAlign: "right" }}>
                  <Button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    variant="secondary"
                    size="sm"
                  >
                    Next
                  </Button>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
          <Flex align="start" gap="medium">
            <Box flex={1}>
              <TableRow>
                <TableCell
                  width="min"
                  style={{ textAlign: "center", width: "100%" }}
                >
                  <Text>
                    Page {page} of {totalPages}
                  </Text>
                </TableCell>
              </TableRow>
            </Box>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default InvoiceList;
