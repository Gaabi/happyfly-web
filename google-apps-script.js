/**
 * Happy Fly Website - Contact Form Google Sheets Integration
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/11Jp9aP8fYjRXIlWn4knCV2GN7VIZoxjuN3F_KVJLd9s/edit
 *
 * Setup Instructions:
 * 1. Open the Google Sheet above in your browser.
 * 2. In the top menu bar, click: Extensions -> Apps Script.
 * 3. Delete any default code in Code.gs and paste this entire script.
 * 4. Click the 'Save' icon (floppy disk).
 * 5. In the top-right corner, click: Deploy -> New deployment.
 * 6. Click the gear icon next to "Select type" and choose: Web app.
 * 7. Configure:
 *    - Description: Happy Fly Contact Form
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone
 * 8. Click 'Deploy'.
 * 9. Review permissions and authorize the script when prompted by Google.
 * 10. Copy the Web App URL (ends with /exec).
 * 11. Paste this URL into `happyfly-web/contact/index.html` at the `GOOGLE_SCRIPT_URL` variable.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds to handle concurrent submissions safely
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // If sheet is completely empty, initialize header columns
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Name",
        "Email",
        "Company",
        "Phone",
        "Service",
        "Message",
        "Submitted At"
      ]);

      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter || {};
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var name = (data.name || "").toString().trim();
    var email = (data.email || "").toString().trim();
    var company = (data.company || "N/A").toString().trim();
    var phone = (data.phone || "N/A").toString().trim();
    if (phone.startsWith("+") || phone.startsWith("=")) {
      phone = "'" + phone;
    }
    var service = (data.service || data.inquiryType || "Custom Solution").toString().trim();
    var message = (data.message || "").toString().trim();
    var submittedAt = (data.submittedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })).toString().trim();

    // Append new submission as a new row in exact column order:
    // 1. Name | 2. Email | 3. Company | 4. Phone | 5. Service | 6. Message | 7. Submitted At
    sheet.appendRow([
      name,
      email,
      company,
      phone,
      service,
      message,
      submittedAt
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Row added successfully"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("Happy Fly Contact Form Web App is Active.").setMimeType(ContentService.MimeType.TEXT);
}
