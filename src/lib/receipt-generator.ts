import pdfMake from "pdfmake/build/pdfmake";

// Try to load fonts, but don't fail if they don't load
try {
  // Use dynamic import for fonts in ES modules
  import("pdfmake/build/vfs_fonts").then((pdfFonts) => {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    console.log("PDF fonts loaded successfully");
  }).catch((error) => {
    console.warn("Could not load pdfmake fonts, using default fonts:", error);
  });
} catch (error) {
  console.warn("Could not load pdfmake fonts, using default fonts");
}

export interface ReceiptData {
  receiptId: string;
  customerName: string;
  bookTitle: string;
  isbn: string;
  returnDate: string;
  lateFeeAmount: number;
  paymentMethod: "cash" | "online" | "waived";
  createdAt: string;
  libraryName?: string;
  libraryAddress?: string;
  libraryPhone?: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<void> {
  console.log("Starting PDF generation with data:", data);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const documentDefinition: any = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    content: [
      // Header
      {
        text: data.libraryName || "LibraHub",
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      {
        text: "Return Receipt",
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 15],
        color: "#2c5aa0",
      },

      // Receipt Info
      {
        columns: [
          {
            text: `Receipt ID: ${data.receiptId}`,
            fontSize: 10,
            bold: true,
          },
          {
            text: `Date: ${formattedDate}`,
            fontSize: 10,
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 10],
      },

      // Divider
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#cccccc",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Customer Information
      {
        text: "Customer Information",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 8],
        color: "#2c5aa0",
      },
      {
        text: `Name: ${data.customerName}`,
        fontSize: 10,
        margin: [0, 0, 0, 3],
      },

      // Divider
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#cccccc",
          },
        ],
        margin: [0, 10, 0, 15],
      },

      // Book Information
      {
        text: "Book Information",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 8],
        color: "#2c5aa0",
      },
      {
        columns: [
          {
            text: [
              { text: "Title:\n", bold: true, fontSize: 9 },
              { text: data.bookTitle, fontSize: 10 },
            ],
          },
          {
            text: [
              { text: "ISBN:\n", bold: true, fontSize: 9 },
              { text: data.isbn, fontSize: 10 },
            ],
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        text: [
          { text: "Return Date: ", bold: true, fontSize: 9 },
          { text: new Date(data.returnDate).toLocaleDateString("en-IN"), fontSize: 10 },
        ],
        margin: [0, 0, 0, 15],
      },

      // Divider
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#cccccc",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Fee Information
      {
        text: "Fee Information",
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 8],
        color: "#2c5aa0",
      },
      {
        columns: [
          {
            text: "Late Fee Amount:",
            fontSize: 10,
            bold: true,
          },
          {
            text: `₹ ${data.lateFeeAmount.toFixed(2)}`,
            fontSize: 10,
            bold: true,
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 8],
      },
      {
        columns: [
          {
            text: "Payment Method:",
            fontSize: 10,
            bold: true,
          },
          {
            text: data.paymentMethod.charAt(0).toUpperCase() + data.paymentMethod.slice(1),
            fontSize: 10,
            alignment: "right",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Divider
      {
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: "#cccccc",
          },
        ],
        margin: [0, 0, 0, 15],
      },

      // Footer
      {
        text: "Thank you for using our library services!",
        fontSize: 10,
        alignment: "center",
        italics: true,
        margin: [0, 10, 0, 5],
      },
      {
        text: "This is a computer-generated receipt. No signature is required.",
        fontSize: 8,
        alignment: "center",
        color: "#999999",
      },
    ],
  };

  // Generate PDF and download
  console.log("Creating PDF with document definition");
  const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
  const fileName = `receipt_${data.receiptId.replace(/\D/g, "")}.pdf`;
  console.log("Downloading PDF:", fileName);
  pdfDocGenerator.download(fileName);
  console.log("PDF generation completed");
}

// Test function for debugging
export function testPDFGeneration() {
  console.log("Testing PDF generation...");
  const testData: ReceiptData = {
    receiptId: "TEST-001",
    customerName: "Test Customer",
    bookTitle: "Test Book",
    isbn: "1234567890",
    returnDate: "2026-05-02",
    lateFeeAmount: 100,
    paymentMethod: "cash",
    createdAt: new Date().toISOString(),
    libraryName: "Test Library",
  };

  generateReceiptPDF(testData).then(() => {
    console.log("Test PDF generation completed");
  }).catch((error) => {
    console.error("Test PDF generation failed:", error);
  });
}
