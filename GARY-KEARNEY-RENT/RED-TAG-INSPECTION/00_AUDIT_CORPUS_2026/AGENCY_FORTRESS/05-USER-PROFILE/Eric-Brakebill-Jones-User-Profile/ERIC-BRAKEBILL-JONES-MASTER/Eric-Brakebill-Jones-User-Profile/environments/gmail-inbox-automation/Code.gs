/**
 * Gmail Inbox Automation - Legal Action Items Priority Filter
 * 
 * Reduces inbox to only 72-hour critical action items by archiving
 * non-priority threads and applying labels to keeper threads.
 * 
 * @author Eric Jones - Recovery Compass Legal Operations
 * @version 1.0
 */

function reduceInboxToActionItems() {
  const threads = GmailApp.getInboxThreads();
  const keepers = [
    "Complete Case Package",
    "Meet and Confer",
    "Opposition Final",
    "Protective Order",
    "Monday Action"
  ];
  const pattern = new RegExp(keepers.join("|"), "i");
  let archived = 0;
  let labeled = 0;

  // Archive all non-priority threads
  for (const thread of threads) {
    const subject = thread.getFirstMessageSubject() || "";
    if (!pattern.test(subject)) {
      thread.moveToArchive();
      archived++;
    }
  }
  
  Logger.log(`✅ Archived ${archived} non-priority threads.`);

  // Apply label to action items for quick visual reference
  const labelName = "ACTION – Legal (72 hrs)";
  let label = GmailApp.getUserLabelByName(labelName);
  if (!label) {
    label = GmailApp.createLabel(labelName);
  }
  
  const searchQuery = `subject:(${keepers.map(k => `"${k}"`).join(" OR ")})`;
  const actionThreads = GmailApp.search(searchQuery);
  
  actionThreads.forEach(thread => {
    label.addToThread(thread);
    labeled++;
  });
  
  Logger.log(`🏷️ Applied label to ${labeled} action items.`);
  Logger.log(`📊 Final inbox count: ${GmailApp.getInboxThreads().length}`);
  
  return {
    archived: archived,
    labeled: labeled,
    remaining: GmailApp.getInboxThreads().length
  };
}

/**
 * Undo function - moves all archived threads back to inbox
 * Run this if you need to restore archived emails
 */
function undoArchiveOperation() {
  const archivedThreads = GmailApp.search("is:unread -in:inbox");
  let restored = 0;
  
  archivedThreads.forEach(thread => {
    thread.moveToInbox();
    restored++;
  });
  
  Logger.log(`♻️ Restored ${restored} threads to inbox.`);
  return restored;
}

/**
 * Status check - returns current inbox metrics
 */
function checkInboxStatus() {
  const total = GmailApp.getInboxThreads().length;
  const labelName = "ACTION – Legal (72 hrs)";
  const label = GmailApp.getUserLabelByName(labelName);
  const labeled = label ? label.getThreads().length : 0;
  
  const status = {
    totalInbox: total,
    actionItems: labeled,
    target: 5
  };
  
  Logger.log(`📬 Inbox Status:`);
  Logger.log(`   Total threads: ${status.totalInbox}`);
  Logger.log(`   Action items: ${status.actionItems}`);
  Logger.log(`   Target: ${status.target}`);
  
  return status;
}

/**
 * Test function - runs in dry-run mode without making changes
 */
function testInboxReduction() {
  const threads = GmailApp.getInboxThreads();
  const keepers = [
    "Complete Case Package",
    "Meet and Confer",
    "Opposition Final",
    "Protective Order",
    "Monday Action"
  ];
  const pattern = new RegExp(keepers.join("|"), "i");
  let wouldArchive = 0;
  let wouldKeep = 0;
  
  threads.forEach(thread => {
    const subject = thread.getFirstMessageSubject() || "";
    if (pattern.test(subject)) {
      Logger.log(`✅ KEEP: ${subject}`);
      wouldKeep++;
    } else {
      Logger.log(`📦 ARCHIVE: ${subject.substring(0, 50)}...`);
      wouldArchive++;
    }
  });
  
  Logger.log(`\n📊 Dry Run Results:`);
  Logger.log(`   Would archive: ${wouldArchive}`);
  Logger.log(`   Would keep: ${wouldKeep}`);
  Logger.log(`   Current total: ${threads.length}`);
  
  return {
    wouldArchive: wouldArchive,
    wouldKeep: wouldKeep,
    current: threads.length
  };
}
