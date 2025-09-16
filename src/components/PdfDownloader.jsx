import React from "react";
// import html2pdf from "html2pdf.js";
import html2pdf from "html2pdf.js/dist/html2pdf.min.js";


const PdfDownloader = ({
  elementId,
  filename = "document.pdf",
  buttonLabel = "📄 Download PDF",
  className = "btn btn-secondary",
}) => {
  const handleDownload = () => {
    const element = document.getElementById(elementId);
    if (!element) {
      alert(`Element with ID "${elementId}" not found.`);
      return;
    }

    const options = {
      margin: 0.5,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        console.log("✅ PDF download complete");
        // Optional: toast/alert here
      })
      .catch((err) => {
        console.error("❌ PDF generation failed", err);
      });
  };

  return (
    <button onClick={handleDownload} className={className}>
      {buttonLabel}
    </button>
  );
};

export default PdfDownloader;
