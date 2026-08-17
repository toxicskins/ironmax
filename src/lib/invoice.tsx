import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { COMPANY } from "./company";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#111" },
  title: { fontSize: 20, marginBottom: 4 },
  notice: { fontSize: 9, color: "#888", marginBottom: 20 },
  sectionTitle: { fontSize: 9, color: "#888", textTransform: "uppercase", marginBottom: 4, marginTop: 16 },
  columns: { flexDirection: "row", justifyContent: "space-between" },
  column: { width: "48%" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { color: "#555" },
  table: { marginTop: 16, borderTop: "1 solid #ccc", borderBottom: "1 solid #ccc" },
  tableHeader: { flexDirection: "row", paddingVertical: 6, borderBottom: "1 solid #ccc" },
  tableRow: { flexDirection: "row", paddingVertical: 8 },
  colItem: { width: "40%" },
  colQty: { width: "20%", textAlign: "right" },
  colPrice: { width: "20%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 12 },
  totalLabel: { fontSize: 12, fontWeight: 700, marginRight: 20 },
  totalValue: { fontSize: 12, fontWeight: 700 },
});

export async function renderInvoicePdf(opts: {
  invoiceNumber: string;
  orderId: string;
  orderDate: Date;
  transactionDate: Date;
  customerEmail: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  eurAmount: number;
  coins: number;
}) {
  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Invoice {opts.invoiceNumber}</Text>
        <Text style={styles.notice}>IMPORTANT — retain this copy for your records.</Text>

        <View style={styles.row}><Text style={styles.label}>Order date</Text><Text>{fmtDate(opts.orderDate)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Transaction date</Text><Text>{fmtDate(opts.transactionDate)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Transaction type</Text><Text>Retail sale</Text></View>

        <View style={styles.columns}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>DBA merchant</Text>
            <View style={styles.row}><Text style={styles.label}>Legal name</Text><Text>{COMPANY.legalName}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Register code</Text><Text>{COMPANY.registerCode}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Address</Text><Text>{COMPANY.address}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Email</Text><Text>{COMPANY.email}</Text></View>
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Buyer</Text>
            <View style={styles.row}><Text style={styles.label}>Name</Text><Text>{opts.buyerName || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Email</Text><Text>{opts.customerEmail}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Phone</Text><Text>{opts.buyerPhone || "—"}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Address</Text><Text>{opts.buyerAddress || "—"}</Text></View>
          </View>
        </View>

        <View style={styles.row}><Text style={styles.label}>Order ID</Text><Text>{opts.orderId}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Invoice ID</Text><Text>{opts.invoiceNumber}</Text></View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colItem, styles.label]}>Item</Text>
            <Text style={[styles.colQty, styles.label]}>Qty</Text>
            <Text style={[styles.colPrice, styles.label]}>Price</Text>
            <Text style={[styles.colTotal, styles.label]}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.colItem}>IRONMAX Points ({opts.coins.toLocaleString("en-US")} pts)</Text>
            <Text style={styles.colQty}>1</Text>
            <Text style={styles.colPrice}>€{opts.eurAmount.toFixed(2)}</Text>
            <Text style={styles.colTotal}>€{opts.eurAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total amount</Text>
          <Text style={styles.totalValue}>€{opts.eurAmount.toFixed(2)}</Text>
        </View>

        <Text style={{ marginTop: 30, fontSize: 9, color: "#888" }}>
          Points are a virtual in-platform balance with no cash value and cannot be withdrawn or exchanged.
        </Text>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
