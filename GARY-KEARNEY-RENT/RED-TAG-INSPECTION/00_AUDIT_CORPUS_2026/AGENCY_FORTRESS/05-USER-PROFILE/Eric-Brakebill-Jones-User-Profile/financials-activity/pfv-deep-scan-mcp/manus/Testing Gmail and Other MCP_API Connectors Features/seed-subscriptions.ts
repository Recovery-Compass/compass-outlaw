import { drizzle } from "drizzle-orm/mysql2";
import { subscriptions, protectedTools } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

// Verified subscriptions from Wells Fargo and Capital One statements
const verifiedSubscriptions = [
  // Wells Fargo - High Priority Targets
  { userId: 1, vendor: "MANUS AI", amount: 23400, frequency: "monthly", lastChargeDate: new Date("2025-11-03"), status: "active", notes: "Nov 3 charge, prorated refund possible $179.40", category: "AI Tools", priority: "high" },
  { userId: 1, vendor: "Otter.AI", amount: 9000, frequency: "monthly", lastChargeDate: new Date("2025-10-19"), status: "active", notes: "Wells Fargo | Oct 19 charge, downgrade to free tier option", category: "AI Tools", priority: "high" },
  { vendor: "Google Workspace", amount: 392.11, frequency: "monthly", lastCharge: "2025-11-03", account: "Wells Fargo", category: "Productivity", status: "active", confidence: 85, notes: "Nov 3 charge, audit seats - remove 10 inactive users for $180/mo savings" },
  { vendor: "Scribd", amount: 11.99, frequency: "monthly", lastCharge: "2025-10-27", account: "Wells Fargo", category: "Media", status: "active", confidence: 98, notes: "DUPLICATE - charged 2x on Oct 27, cancel one" },
  { vendor: "Scribd (duplicate)", amount: 11.99, frequency: "monthly", lastCharge: "2025-10-27", account: "Wells Fargo", category: "Media", status: "active", confidence: 98, notes: "DUPLICATE - charged 2x on Oct 27, cancel this one" },
  
  // Wells Fargo - Medium Priority
  { vendor: "Adobe Creative Cloud", amount: 57.00, frequency: "monthly", lastCharge: "2025-10-15", account: "Wells Fargo", category: "Design Tools", status: "active", confidence: 90, notes: "Multiple charges, consolidate to Photography Plan" },
  { vendor: "Vercel", amount: 20.00, frequency: "monthly", lastCharge: "2025-10-20", account: "Wells Fargo", category: "Web Hosting", status: "active", confidence: 90, notes: "Keep this, cancel Netlify instead" },
  { vendor: "Figma", amount: 24.00, frequency: "monthly", lastCharge: "2025-10-16", account: "Wells Fargo", category: "Design Tools", status: "active", confidence: 90, notes: "Downgrade to Free tier" },
  { vendor: "KnowledgeOwl", amount: 187.50, frequency: "monthly", lastCharge: "2025-11-05", account: "Wells Fargo", category: "Documentation", status: "active", confidence: 85, notes: "Reversed Nov 4, re-billed Nov 5, monitor for issues" },
  { vendor: "WIX.com", amount: 40.00, frequency: "monthly", lastCharge: "2025-10-18", account: "Wells Fargo", category: "Web Hosting", status: "active", confidence: 90, notes: "Redundant with Vercel, cancel if not in use" },
  
  // Capital One - Critical Issues
  { vendor: "BLACKBOX SUBSCRIPTION", amount: 4.99, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "AI Code Tool", status: "active", confidence: 95, notes: "BILLING ERROR - charged 3x in Oct, request $25-75 refund" },
  { vendor: "BLACKBOX SUBSCRIPTION (dup 2)", amount: 4.99, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "AI Code Tool", status: "active", confidence: 95, notes: "DUPLICATE 2 - cancel immediately" },
  { vendor: "BLACKBOX SUBSCRIPTION (dup 3)", amount: 4.99, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "AI Code Tool", status: "active", confidence: 95, notes: "DUPLICATE 3 - cancel immediately" },
  { vendor: "Apple.com/Bill", amount: 200.00, frequency: "monthly", lastCharge: "2025-09-15", account: "Capital One", category: "Unknown", status: "active", confidence: 70, notes: "MYSTERY CHARGE 1 - $200, urgent audit at appleid.apple.com" },
  { vendor: "Apple.com/Bill (2)", amount: 200.00, frequency: "monthly", lastCharge: "2025-09-15", account: "Capital One", category: "Unknown", status: "active", confidence: 70, notes: "MYSTERY CHARGE 2 - $200, urgent audit at appleid.apple.com" },
  { vendor: "Apple.com/Bill (3)", amount: 18.99, frequency: "monthly", lastCharge: "2025-09-15", account: "Capital One", category: "Apple Services", status: "active", confidence: 90, notes: "Likely iCloud+ or Apple One" },
  
  // Capital One - Dev Tools
  { vendor: "Claude.AI", amount: 20.00, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "AI Assistant", status: "active", confidence: 95, notes: "Review usage, keep if essential" },
  { vendor: "PADDLE.NET* APPBANTER", amount: 50.00, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "Unknown", status: "active", confidence: 60, notes: "UNKNOWN SERVICE - research what this is" },
  { vendor: "Cloudflare", amount: 7.20, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "Web Services", status: "active", confidence: 85, notes: "Charge 1 of 3, consolidate domains" },
  { vendor: "Cloudflare (2)", amount: 7.19, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "Web Services", status: "active", confidence: 85, notes: "Charge 2 of 3, consolidate domains" },
  { vendor: "Cloudflare (3)", amount: 2.03, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "Web Services", status: "active", confidence: 85, notes: "Charge 3 of 3, consolidate domains" },
  { vendor: "Netlify", amount: 20.00, frequency: "monthly", lastCharge: "2025-10-16", account: "Capital One", category: "Web Hosting", status: "active", confidence: 90, notes: "REDUNDANT with Vercel, cancel this" },
  { vendor: "Canva", amount: 21.99, frequency: "monthly", lastCharge: "2025-10-15", account: "Capital One", category: "Design Tools", status: "active", confidence: 95, notes: "Keep or downgrade to Free" },
  { vendor: "Bito Inc.", amount: 13.57, frequency: "monthly", lastCharge: "2025-09-14", account: "Capital One", category: "AI Code Tool", status: "active", confidence: 80, notes: "Review usage vs BLACKBOX/Copilot" },
  { vendor: "Amazon Prime", amount: 7.67, frequency: "monthly", lastCharge: "2025-09-14", account: "Capital One", category: "Streaming", status: "active", confidence: 95, notes: "Keep" },
  { vendor: "Prime Video", amount: 3.79, frequency: "monthly", lastCharge: "2025-09-14", account: "Capital One", category: "Streaming", status: "active", confidence: 95, notes: "Add-on channel, review if needed" },
];

// Protected tools that should NOT be cancelled
const protectedToolsList = [
  { toolName: "MANUS AI", reason: "Essential AI workflow tool", protectedUntil: null },
  { toolName: "Otter.AI", reason: "Primary transcription service", protectedUntil: null },
  { toolName: "Scribd", reason: "Research and reading", protectedUntil: null },
  { toolName: "Google Workspace", reason: "Core business infrastructure", protectedUntil: null },
  { toolName: "Claude.AI", reason: "AI development tool", protectedUntil: null },
  { toolName: "Perplexity", reason: "Research assistant", protectedUntil: null },
  { toolName: "GitHub Copilot", reason: "Code development", protectedUntil: null },
  { toolName: "Canva", reason: "Design and branding", protectedUntil: null },
  { toolName: "Amazon Prime", reason: "Personal use", protectedUntil: null },
  { toolName: "Vercel", reason: "Primary hosting platform", protectedUntil: null },
];

async function seed() {
  console.log("Seeding database with verified subscriptions...");
  
  // Insert protected tools
  for (const tool of protectedToolsList) {
    await db.insert(protectedTools).values(tool);
  }
  console.log(`✓ Inserted ${protectedToolsList.length} protected tools`);
  
  // Insert subscriptions
  for (const sub of verifiedSubscriptions) {
    await db.insert(subscriptions).values({
      ...sub,
      discoveryMethod: "bank_statement",
      discoveryDate: new Date(),
    });
  }
  console.log(`✓ Inserted ${verifiedSubscriptions.length} subscriptions`);
  
  // Calculate totals
  const wellsFargoTotal = verifiedSubscriptions
    .filter(s => s.account === "Wells Fargo")
    .reduce((sum, s) => sum + s.amount, 0);
  
  const capitalOneTotal = verifiedSubscriptions
    .filter(s => s.account === "Capital One")
    .reduce((sum, s) => sum + s.amount, 0);
  
  console.log("\n" + "=".repeat(60));
  console.log("SUBSCRIPTION TOTALS");
  console.log("=".repeat(60));
  console.log(`Wells Fargo:  $${wellsFargoTotal.toFixed(2)}/month`);
  console.log(`Capital One:  $${capitalOneTotal.toFixed(2)}/month`);
  console.log(`TOTAL:        $${(wellsFargoTotal + capitalOneTotal).toFixed(2)}/month`);
  console.log(`ANNUAL:       $${((wellsFargoTotal + capitalOneTotal) * 12).toFixed(2)}/year`);
  console.log("=".repeat(60));
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
