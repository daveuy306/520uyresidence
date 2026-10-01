const SHEETS_WEBHOOK_KEY = 'luxe_budget_sheets_webhook';
const AUTO_SYNC_SHEETS_KEY = 'luxe_budget_auto_sync_sheets';

export function getSheetsWebhookUrl() {
  return localStorage.getItem(SHEETS_WEBHOOK_KEY) || '';
}

export function saveSheetsWebhookUrl(url) {
  localStorage.setItem(SHEETS_WEBHOOK_KEY, url.trim());
}

export function getAutoSyncSheets() {
  return localStorage.getItem(AUTO_SYNC_SHEETS_KEY) === 'true';
}

export function setAutoSyncSheets(enabled) {
  localStorage.setItem(AUTO_SYNC_SHEETS_KEY, enabled ? 'true' : 'false');
}

export function formatTransactionsToCSV(transactions, categories = []) {
  const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));

  const headers = ['Date', 'Title', 'Type', 'Category', 'Amount ($)', 'Note', 'ID'];

  const rows = (transactions || []).map((tx) => {
    const catName = tx.category || categoryMap.get(tx.categoryId) || 'Uncategorized';
    const title = (tx.title || '').replace(/"/g, '""');
    const note = (tx.notes || tx.note || '').replace(/"/g, '""');
    return [
      tx.date || '',
      `"${title}"`,
      tx.type || 'expense',
      `"${catName}"`,
      tx.amount ? Number(tx.amount).toFixed(2) : '0.00',
      `"${note}"`,
      tx.id || ''
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function copyCSVToClipboard(transactions, categories) {
  const csvText = formatTransactionsToCSV(transactions, categories);
  return navigator.clipboard.writeText(csvText);
}

export function downloadCSVFile(transactions, categories) {
  const csvText = formatTransactionsToCSV(transactions, categories);
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `luxe_budget_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function syncToGoogleSheets(transactions, categories, webhookUrlOverride) {
  const url = webhookUrlOverride || getSheetsWebhookUrl();
  if (!url) {
    throw new Error('No Google Sheets Webhook URL configured.');
  }

  const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));

  const payload = {
    action: 'sync_all',
    timestamp: new Date().toISOString(),
    transactions: (transactions || []).map((tx) => ({
      id: tx.id,
      date: tx.date,
      title: tx.title || '',
      type: tx.type,
      category: tx.category || categoryMap.get(tx.categoryId) || 'Uncategorized',
      amount: tx.amount,
      note: tx.notes || tx.note || ''
    }))
  };

  // Google Apps Script requires no-cors or JSON payloads
  const response = await fetch(url, {
    method: 'POST',
    mode: 'no-cors', // standard for Google Apps Script Web App endpoints
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return response;
}

export const APPS_SCRIPT_TEMPLATE = `// Google Apps Script for Luxe Budget App Integration
// Instructions:
// 1. Open your Google Sheet
// 2. Go to Extensions > Apps Script
// 3. Paste this code into Code.gs
// 4. Click Deploy > New Deployment > Select type: "Web app"
// 5. Execute as: "Me", Who has access: "Anyone"
// 6. Click Deploy, copy the Web App URL, and paste it into Luxe Budget App!

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["ID", "Date", "Title", "Type", "Category", "Amount ($)", "Note", "Updated At"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }

    if (contents.action === "sync_all") {
      sheet.clearContents();
      sheet.appendRow(["ID", "Date", "Title", "Type", "Category", "Amount ($)", "Note", "Updated At"]);
      sheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");

      var now = new Date().toLocaleString();
      var txs = contents.transactions || [];
      for (var i = 0; i < txs.length; i++) {
        var tx = txs[i];
        sheet.appendRow([tx.id, tx.date, tx.title || "", tx.type, tx.category, tx.amount, tx.note, now]);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
