/**
 * Database seed script — run with:  pnpm db:seed
 * Creates the default admin user and sample data for demo purposes.
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, leads, matters, tasks, companies } from "../drizzle/schema";
import { hashPassword } from "./_core/auth";
import { count, eq } from "drizzle-orm";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const client = postgres(url);
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database…");

  // ── Admin user ────────────────────────────────────────────────────────────
  const [existing] = await db.select({ count: count() }).from(users).where(eq(users.email, "admin@legalcrm.com"));
  if (Number(existing?.count ?? 0) === 0) {
    const hash = await hashPassword("Admin1234!");
    await db.insert(users).values({
      email: "admin@legalcrm.com",
      name: "Admin User",
      passwordHash: hash,
      role: "admin",
      status: "active",
    });
    console.log("✅ Admin user created: admin@legalcrm.com / Admin1234!");
  } else {
    console.log("ℹ️  Admin user already exists — skipping");
  }

  // Fetch admin ID
  const [admin] = await db.select().from(users).where(eq(users.email, "admin@legalcrm.com")).limit(1);
  if (!admin) { console.error("Admin not found after insert"); await client.end(); return; }

  // ── Sample company ────────────────────────────────────────────────────────
  const [compExisting] = await db.select({ count: count() }).from(companies);
  if (Number(compExisting?.count ?? 0) === 0) {
    await db.insert(companies).values({
      name: "Acme Corporation",
      industry: "Technology",
      website: "https://acme.example.com",
      phone: "+1 555-000-0001",
      email: "legal@acme.example.com",
      createdBy: admin.id,
    });
    console.log("✅ Sample company created");
  }

  // ── Sample leads ──────────────────────────────────────────────────────────
  const [leadExisting] = await db.select({ count: count() }).from(leads);
  if (Number(leadExisting?.count ?? 0) === 0) {
    await db.insert(leads).values([
      {
        leadCode: "LEAD-0001",
        dateOfEnquiry: new Date().toISOString().split("T")[0],
        clientName: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        phoneNumber: "+1 555-100-1001",
        serviceRequested: "Employment Law",
        shortDescription: "Wrongful termination case — needs urgent consultation",
        urgencyLevel: "High",
        communicationChannel: "Phone",
        currentStatus: "Contacted",
        proposalValue: "15000",
        internalNotes: "Client is very motivated, follow up within 48 hours",
        createdBy: admin.id,
      },
      {
        leadCode: "LEAD-0002",
        dateOfEnquiry: new Date().toISOString().split("T")[0],
        clientName: "Marcus Chen",
        email: "m.chen@example.com",
        phoneNumber: "+1 555-200-2002",
        serviceRequested: "Corporate Formation",
        shortDescription: "Start-up needs LLC formation and operating agreement",
        urgencyLevel: "Medium",
        communicationChannel: "Email",
        currentStatus: "Meeting Scheduled",
        proposalValue: "5000",
        createdBy: admin.id,
      },
      {
        leadCode: "LEAD-0003",
        dateOfEnquiry: new Date().toISOString().split("T")[0],
        clientName: "Priya Patel",
        email: "priya.p@example.com",
        phoneNumber: "+1 555-300-3003",
        serviceRequested: "Immigration",
        shortDescription: "H-1B visa renewal for software engineer",
        urgencyLevel: "Urgent",
        communicationChannel: "Website",
        currentStatus: "Proposal Sent",
        proposalValue: "8500",
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        createdBy: admin.id,
      },
    ]);
    console.log("✅ Sample leads created");
  }

  // ── Sample matter ─────────────────────────────────────────────────────────
  const [matterExisting] = await db.select({ count: count() }).from(matters);
  if (Number(matterExisting?.count ?? 0) === 0) {
    await db.insert(matters).values({
      matterCode: "MAT-2025-001",
      title: "Johnson v. Acme Corp — Wrongful Termination",
      clientName: "Sarah Johnson",
      clientEmail: "sarah.johnson@example.com",
      practiceArea: "Employment Law",
      status: "active",
      priority: "high",
      openDate: new Date().toISOString().split("T")[0],
      estimatedValue: "15000",
      assignedTo: admin.id,
      createdBy: admin.id,
    });
    console.log("✅ Sample matter created");
  }

  // ── Sample tasks ──────────────────────────────────────────────────────────
  const [taskExisting] = await db.select({ count: count() }).from(tasks);
  if (Number(taskExisting?.count ?? 0) === 0) {
    await db.insert(tasks).values([
      {
        title: "Review employment contract for Sarah Johnson",
        description: "Read and annotate the original employment agreement",
        status: "todo",
        priority: "high",
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        assignedTo: admin.id,
        createdBy: admin.id,
      },
      {
        title: "Prepare LLC operating agreement for Marcus Chen",
        description: "Draft and review operating agreement per client instructions",
        status: "in_progress",
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        assignedTo: admin.id,
        createdBy: admin.id,
      },
      {
        title: "File H-1B renewal documents",
        description: "Submit all required forms to USCIS",
        status: "todo",
        priority: "urgent",
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
        assignedTo: admin.id,
        createdBy: admin.id,
      },
    ]);
    console.log("✅ Sample tasks created");
  }

  console.log("\n✅ Seed complete!");
  console.log("   Login: admin@legalcrm.com / Admin1234!");
  await client.end();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.end();
  process.exit(1);
});
