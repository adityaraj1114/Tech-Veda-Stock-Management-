import React from "react";
import html2pdf from "html2pdf.js";

const PdfDownloader = ({ elementId, filename = "document.pdf", buttonLabel = "📄 Download PDF", className = "btn btn-secondary" }) => {
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

    html2pdf().set(options).from(element).save();
  };

  return (
    <button onClick={handleDownload} className={className}>
      {buttonLabel}
    </button>
  );
};

export default PdfDownloader;
