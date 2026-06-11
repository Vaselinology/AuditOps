import { chromium } from 'playwright';

export async function POST(request) {
  try {
    console.log("PDF generation request received");
    const { source } = await request.json();
    const { html } = source;

    if (!html) {
      console.log("No HTML content provided");
      return Response.json({ error: "HTML content is required" }, { status: 400 });
    }

    console.log("Launching browser for PDF generation");
    // Launch browser with no-sandbox for server environments
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log("Setting HTML content");
    // Set content and generate PDF
    await page.setContent(html, { waitUntil: 'networkidle' });
    console.log("Generating PDF");
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    console.log("PDF generated successfully");

    // Return PDF as blob
    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=document.pdf'
      }
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return Response.json(
      { error: "Failed to generate PDF", details: error.message },
      { status: 500 }
    );
  }
}
