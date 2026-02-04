/**
 * EMAIL TRIAGE DASHBOARD - OPTIMIZED VERSION
 * Recovery Compass | Eric Brakebill Jones
 * 
 * Purpose: Reduce 3 hours/day email triage → 15 minutes
 * Philosophy: Execute don't assign. Clarity over completeness.
 * 
 * ONE-CLICK SETUP - PASTE THIS ENTIRE FILE INTO APPS SCRIPT EDITOR
 */

/**
 * STEP 1: Run this function first
 * Tools → Apps Script → Click "Run" button next to setupEmailTriage
 */
function setupEmailTriage() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();
  
  try {
    Logger.log('Starting Email Triage Dashboard setup...');
    
    // Verify Priority Dashboard sheet exists
    const masterSheet = ss.getSheetByName('Priority Dashboard');
    if (!masterSheet) {
      ui.alert('❌ Error', 
        'Cannot find "Priority Dashboard" sheet.\n\n' +
        'Please ensure the sheet exists and try again.',
        ui.ButtonSet.OK);
      return;
    }
    
    Logger.log('✓ Found Priority Dashboard sheet');
    
    // Add smart columns
    addSmartColumns(masterSheet);
    Logger.log('✓ Added smart columns K-O');
    
    // Create dashboard
    createDashboardTab(ss);
    Logger.log('✓ Created Dashboard tab');
    
    // Create support tabs
    createSupportTabs(ss);
    Logger.log('✓ Created support tabs');
    
    // Add menu
    createCustomMenu();
    Logger.log('✓ Added custom menu');
    
    ui.alert('✅ Setup Complete!',
      '📊 Dashboard tab created with visual KPIs\n' +
      '⏰ "Next 24 Hours" shows immediate priorities\n' +
      '✅ "Waiting on Others" lets you rest guilt-free\n\n' +
      '💙 Time saved: ~3 hours/day → 15 minutes/day',
      ui.ButtonSet.OK);
      
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    ui.alert('⚠️ Setup Issue',
      'Error during setup:\n\n' + error.toString() + '\n\n' +
      'Check View → Logs for details.',
      ui.ButtonSet.OK);
  }
}

/**
 * PHASE 1: Add Smart Columns (K-O)
 */
function addSmartColumns(sheet) {
  const lastRow = sheet.getLastRow();
  
  // Add headers
  sheet.getRange('K1:O1').setValues([[
    'Project Area',
    'ThreadID', 
    'RepliedByMe',
    'Auto-Confidence',
    'Manual Override'
  ]]).setFontWeight('bold').setBackground('#d9d9d9');
  
  if (lastRow < 2) return; // No data rows
  
  // K: Project Area (ArrayFormula)
  sheet.getRange('K2').setFormula(
    '=ARRAYFORMULA(IF(A2:A="",,IF(' +
    'REGEXMATCH(LOWER(C2:C&" "&D2:D&" "&E2:E),"freddy@sayeghlaw|kirk|25pdro|dvro|legal"),"Nuha/SVS",' +
    'IF(REGEXMATCH(LOWER(C2:C&" "&D2:D&" "&E2:E),"amy mccellon|poa|kathy hart|gilmer|austin bank"),"Kathy Hart",' +
    'IF(REGEXMATCH(LOWER(C2:C&" "&D2:D&" "&E2:E),"jacob|randall|compliance|erdmethod"),"WFD",' +
    'IF(REGEXMATCH(LOWER(C2:C&" "&D2:D&" "&E2:E),"lovable|cloudflare|recovery-compass"),"Recovery Compass",' +
    '"Personal/Other"))))))'
  );
  
  // L: ThreadID (ArrayFormula)
  sheet.getRange('L2').setFormula(
    '=ARRAYFORMULA(IF(A2:A="",,IF(LEN(H2:H)>0,H2:H,LEFT(D2:D,30)&"-"&TEXT(B2:B,"YYYYMMDD"))))'
  );
  
  // M: RepliedByMe (ArrayFormula)
  sheet.getRange('M2').setFormula(
    '=ARRAYFORMULA(IF(A2:A="",,IF(REGEXMATCH(D2:D,"Re:"),"Replied","No reply")))'
  );
  
  // N: Auto-Confidence (ArrayFormula)
  sheet.getRange('N2').setFormula(
    '=ARRAYFORMULA(IF(A2:A="",,IF(' +
    'REGEXMATCH(LOWER(C2:C&" "&E2:E),"@sayeghlaw|@erdmethod|urgent|asap|deadline"),"High",' +
    'IF(K2:K="Personal/Other","Low","Medium"))))'
  );
  
  // O: Manual Override (leave blank for user input)
  // No formula needed
  
  // Apply conditional formatting to M column
  const repliedRange = sheet.getRange('M2:M' + lastRow);
  const rules = sheet.getConditionalFormatRules();
  
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Replied')
    .setBackground('#d9ead3')
    .setRanges([repliedRange])
    .build());
    
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('No reply')
    .setBackground('#f4cccc')
    .setRanges([repliedRange])
    .build());
    
  sheet.setConditionalFormatRules(rules);
}

/**
 * PHASE 2: Create Dashboard Tab
 */
function createDashboardTab(ss) {
  // Delete existing dashboard if present
  let dashboard = ss.getSheetByName('Dashboard');
  if (dashboard) {
    ss.deleteSheet(dashboard);
  }
  
  // Create new dashboard
  dashboard = ss.insertSheet('Dashboard');
  dashboard.setTabColor('#4285f4');
  
  // Set column widths
  dashboard.setColumnWidths(1, 5, 200);
  
  let row = 1;
  
  // TITLE
  dashboard.getRange(row, 1, 1, 5).merge()
    .setValue('📧 EMAIL TRIAGE DASHBOARD')
    .setFontSize(18)
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');
  row += 2;
  
  // KPI CARDS
  dashboard.getRange(row, 1, 1, 5).merge()
    .setValue('📊 KEY METRICS')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#f3f3f3');
  row++;
  
  // High Priority
  dashboard.getRange(row, 1).setValue('🔴 High Priority');
  dashboard.getRange(row, 2).setFormula('=COUNTIFS(\'Priority Dashboard\'!N:N,"High",\'Priority Dashboard\'!M:M,"No reply")');
  dashboard.getRange(row, 3, 1, 3).merge().setValue('High-confidence emails needing immediate action');
  dashboard.getRange(row, 1, 1, 5).setBackground('#f4cccc');
  row++;
  
  // Action Needed
  dashboard.getRange(row, 1).setValue('🟠 Action Needed');
  dashboard.getRange(row, 2).setFormula('=COUNTIF(\'Priority Dashboard\'!M:M,"No reply")');
  dashboard.getRange(row, 3, 1, 3).merge().setValue('All emails without replies');
  dashboard.getRange(row, 1, 1, 5).setBackground('#fce5cd');
  row++;
  
  // Already Handled
  dashboard.getRange(row, 1).setValue('🟢 Already Handled');
  dashboard.getRange(row, 2).setFormula('=COUNTIF(\'Priority Dashboard\'!M:M,"Replied")');
  dashboard.getRange(row, 3, 1, 3).merge().setValue('Emails you\'ve responded to');
  dashboard.getRange(row, 1, 1, 5).setBackground('#d9ead3');
  row++;
  
  // Total Emails
  dashboard.getRange(row, 1).setValue('📨 Total Emails');
  dashboard.getRange(row, 2).setFormula('=COUNTA(\'Priority Dashboard\'!C:C)-1');
  dashboard.getRange(row, 3, 1, 3).merge().setValue('All emails in system');
  dashboard.getRange(row, 1, 1, 5).setBackground('#cfe2f3');
  row += 2;
  
  // NEXT 24 HOURS SECTION
  dashboard.getRange(row, 1, 1, 5).merge()
    .setValue('⏰ NEXT 24 HOURS - ACTION REQUIRED')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#cc0000')
    .setFontColor('#ffffff');
  row++;
  
  dashboard.getRange(row, 1, 1, 5).setValues([['From', 'Subject', 'Snippet', 'Project', 'Confidence']])
    .setFontWeight('bold')
    .setBackground('#efefef');
  row++;
  
  dashboard.getRange(row, 1).setFormula(
    '=QUERY(\'Priority Dashboard\'!C:N,"SELECT C,D,E,K,N WHERE M=\'No reply\' AND (N=\'High\' OR N=\'Medium\') ORDER BY B DESC LIMIT 20",1)'
  );
  row += 22;
  
  // PROJECT SECTIONS
  const projects = [
    ['Nuha/SVS', '#fff2cc'],
    ['Kathy Hart', '#fff2cc'],
    ['WFD', '#fff2cc'],
    ['Recovery Compass', '#fff2cc']
  ];
  
  projects.forEach(([projectName, color]) => {
    dashboard.getRange(row, 1, 1, 5).merge()
      .setValue('📁 ' + projectName.toUpperCase())
      .setFontSize(13)
      .setFontWeight('bold')
      .setBackground(color);
    row++;
    
    dashboard.getRange(row, 1, 1, 5).setValues([['From', 'Subject', 'Snippet', 'Replied', 'Confidence']])
      .setFontWeight('bold')
      .setBackground('#efefef');
    row++;
    
    dashboard.getRange(row, 1).setFormula(
      `=QUERY('Priority Dashboard'!C:N,"SELECT C,D,E,M,N WHERE K='${projectName}' ORDER BY B DESC LIMIT 10",1)`
    );
    row += 12;
  });
  
  // WAITING ON OTHERS SECTION
  dashboard.getRange(row, 1, 1, 5).merge()
    .setValue('✅ WAITING ON OTHERS - Rest Guilt-Free')
    .setFontSize(14)
    .setFontWeight('bold')
    .setBackground('#00ff00')
    .setFontColor('#000000');
  row++;
  
  dashboard.getRange(row, 1, 1, 5).setValues([['From', 'Subject', 'Snippet', 'Project', 'Date']])
    .setFontWeight('bold')
    .setBackground('#efefef');
  row++;
  
  dashboard.getRange(row, 1).setFormula(
    '=QUERY(\'Priority Dashboard\'!B:N,"SELECT C,D,E,K,B WHERE M=\'Replied\' ORDER BY B DESC LIMIT 15",1)'
  );
  
  // Freeze header rows
  dashboard.setFrozenRows(1);
}

/**
 * PHASE 3: Create Support Tabs
 */
function createSupportTabs(ss) {
  // Configuration tab
  let config = ss.getSheetByName('Configuration');
  if (!config) {
    config = ss.insertSheet('Configuration');
    config.setTabColor('#00ff00');
    
    config.getRange('A1:D1').merge()
      .setValue('⚙️ EMAIL TRIAGE CONFIGURATION')
      .setFontSize(14)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
    
    const configData = [
      ['', '', '', ''],
      ['Project Detection Rules', '', '', ''],
      ['Project', 'Keywords (case-insensitive)', 'Priority', 'Notes'],
      ['Nuha/SVS', 'freddy@sayeghlaw, Kirk, 25PDRO, DVRO, legal', 'High', 'Family law case'],
      ['Kathy Hart', 'Amy McCellon, POA, Kathy Hart, Gilmer, Austin Bank', 'High', 'Power of Attorney'],
      ['WFD', 'Jacob, Randall, compliance, erdmethod', 'Medium', 'Partnership MOU'],
      ['Recovery Compass', 'Lovable, Cloudflare, recovery-compass', 'Medium', 'Nonprofit EBP mission'],
      ['', '', '', ''],
      ['Confidence Rules', '', '', ''],
      ['Level', 'Criteria', '', ''],
      ['High', 'From @sayeghlaw/@erdmethod OR urgent/ASAP/deadline keywords', '', ''],
      ['Medium', 'Matches known project, not urgent', '', ''],
      ['Low', 'Personal/Other category', '', ''],
      ['', '', '', ''],
      ['Reply Detection', '', '', ''],
      ['Method', 'Checks for "Re:" in subject line', '', ''],
      ['User Email', 'eric@recovery-compass.org', '', '']
    ];
    
    config.getRange(2, 1, configData.length, 4).setValues(configData);
    config.getRange('A2:D2').merge().setFontWeight('bold').setBackground('#fff2cc');
    config.getRange('A3:D3').setFontWeight('bold').setBackground('#efefef');
    config.getRange('A9:D9').merge().setFontWeight('bold').setBackground('#fff2cc');
    config.getRange('A10:D10').setFontWeight('bold').setBackground('#efefef');
    config.getRange('A15:D15').merge().setFontWeight('bold').setBackground('#fff2cc');
    
    config.setColumnWidths(1, 4, 250);
  }
  
  // Manual Review Queue tab
  let queue = ss.getSheetByName('Manual Review Queue');
  if (!queue) {
    queue = ss.insertSheet('Manual Review Queue');
    queue.setTabColor('#ff9900');
    
    queue.getRange('A1:E1').setValues([['Date', 'From', 'Subject', 'Auto-Project', 'Confidence']])
      .setFontWeight('bold')
      .setBackground('#efefef');
    
    queue.getRange('A2').setFormula(
      '=QUERY(\'Priority Dashboard\'!B:N,"SELECT B,C,D,K,N WHERE K=\'Personal/Other\' OR N=\'Low\' ORDER BY B DESC",1)'
    );
    
    queue.setColumnWidths(1, 5, 200);
  }
}

/**
 * Create custom menu
 */
function createCustomMenu() {
  SpreadsheetApp.getUi()
    .createMenu('📧 Email Triage')
    .addItem('🔄 Refresh Dashboard', 'refreshDashboard')
    .addItem('⚙️ Re-run Setup', 'setupEmailTriage')
    .addToUi();
}

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('✅ Dashboard Refreshed!');
}

/**
 * Auto-run on spreadsheet open
 */
function onOpen() {
  createCustomMenu();
}
