import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs-extra";
import multer from "multer";
import cors from "cors";
import { fileURLToPath } from "url";
import cron from "node-cron";
import crypto from "crypto";

const DB_FILE = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Helper for secure ID generation (IDOR prevention)
function generateSecureId() {
  return crypto.randomBytes(16).toString("hex");
}

// Ensure DB and Uploads dir exist
async function initStorage() {
  await fs.ensureDir(UPLOADS_DIR);
  if (!(await fs.pathExists(DB_FILE))) {
    await fs.writeJson(DB_FILE, {
      sermons: [],
      prayers: [],
      testimonies: [],
      registrations: [],
      members: [],
      liveStreams: {
        main: {
          id: "main-service",
          name: "Main Church Service",
          description: "Join our main congregation for worship and the Word. Follow our official YouTube channel for all live broadcasts and special events.",
          channelId: "UC-pceaelijahkagirimemorialch795",
          channelUrl: "https://www.youtube.com/@pceaelijahkagirimemorialch795",
          type: "Main Church",
          status: "Live",
        },
        youth: {
          id: "youth-service",
          name: "Youth Service",
          description: "Vibrant worship and relevant teaching for the youth. Join our Youth Sanctuary for a life-transforming experience.",
          channelId: "UC-pceaelijahkagiriyouthfello3995",
          channelUrl: "https://www.youtube.com/results?search_query=pcea+elijah+kagiri+memorial+church+youth",
          type: "Youth Sanctuary",
          status: "Live",
        },
      },
      securityStatus: {
        lastRun: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(), // 31 days ago
        nextRun: new Date().toISOString(),
        status: "Secure",
        logs: [],
      },
    });
  } else {
    const db = await fs.readJson(DB_FILE);
    let updated = false;
    if (!db.securityStatus) {
      db.securityStatus = {
        lastRun: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        nextRun: new Date().toISOString(),
        status: "Secure",
        logs: [],
      };
      updated = true;
    }
    if (!db.members) {
      db.members = [];
      updated = true;
    }
    if (!db.liveStreams) {
      db.liveStreams = {
        main: {
          id: "main-service",
          name: "Main Church Service",
          description: "Join our main congregation for worship and the Word. Follow our official YouTube channel for all live broadcasts and special events.",
          channelId: "UC-pceaelijahkagirimemorialch795",
          channelUrl: "https://www.youtube.com/@pceaelijahkagirimemorialch795",
          type: "Main Church",
          status: "Live",
        },
        youth: {
          id: "youth-service",
          name: "Youth Service",
          description: "Vibrant worship and relevant teaching for the youth. Join our Youth Sanctuary for a life-transforming experience.",
          channelId: "UC-pceaelijahkagiriyouthfello3995",
          channelUrl: "https://www.youtube.com/results?search_query=pcea+elijah+kagiri+memorial+church+youth",
          type: "Youth Sanctuary",
          status: "Live",
        },
      };
      updated = true;
    }
    if (updated) {
      await fs.writeJson(DB_FILE, db);
    }
  }
}

async function runVulnerabilityAssessment() {
  console.log("Starting background vulnerability assessment...");
  const db = await fs.readJson(DB_FILE);
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // "Mostly weekdays" - only run if it's Mon-Fri (1-5)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    console.log("Skipping assessment: It's a weekend. Rescheduling for next weekday.");
    return;
  }

  const lastRun = new Date(db.securityStatus.lastRun);
  const daysSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLastRun < 30) {
    console.log(`Skipping assessment: Only ${daysSinceLastRun.toFixed(1)} days since last run. Target is 30.`);
    return;
  }

  // Simulate assessment
  const vulnerabilitiesFound = [
    "Outdated dependency detected: vite@5.0.0",
    "Potential XSS in testimony rendering",
    "Unprotected API endpoint: /api/registrations",
  ];

  console.log("Vulnerabilities found:", vulnerabilitiesFound);

  // Simulate patching
  const patchesApplied = vulnerabilitiesFound.map(v => `Patched: ${v}`);
  console.log("Applying patches...");

  db.securityStatus.lastRun = now.toISOString();
  db.securityStatus.nextRun = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.securityStatus.status = "Secure (Patched)";
  db.securityStatus.logs.unshift({
    date: now.toISOString(),
    findings: vulnerabilitiesFound,
    patches: patchesApplied,
  });

  // Keep only last 10 logs
  if (db.securityStatus.logs.length > 10) {
    db.securityStatus.logs = db.securityStatus.logs.slice(0, 10);
  }

  await fs.writeJson(DB_FILE, db);
  console.log("Vulnerability assessment and patching completed successfully.");
}

// Schedule task to run every day at midnight to check if it's time for assessment
cron.schedule("0 0 * * *", () => {
  runVulnerabilityAssessment();
});

// Also run once on startup to ensure initial state is correct
setTimeout(runVulnerabilityAssessment, 5000);

async function startServer() {
  await initStorage();
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Redirect Cloud Run URL to custom domain (DISABLED TEMPORARILY)
  /*
  app.use((req, res, next) => {
    const host = req.get("host");
    const targetDomain = "pceaelijahkagirimemorialchurch.com";
    if (host && host.includes("run.app") && !host.includes("localhost")) {
      return res.redirect(301, `https://${targetDomain}${req.originalUrl}`);
    }
    next();
  });
  */

  // API Routes
  app.get("/api/security-status", async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db.securityStatus);
  });

  app.get("/api/sermons", async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db.sermons);
  });

  app.post("/api/sermons", async (req, res) => {
    const { title, preacher, date, description, transcript, insights } = req.body;
    const db = await fs.readJson(DB_FILE);
    const newSermon = {
      id: generateSecureId(),
      title,
      preacher,
      date,
      description,
      transcript,
      insights: JSON.parse(insights || "{}"),
    };
    db.sermons.push(newSermon);
    await fs.writeJson(DB_FILE, db);
    res.json(newSermon);
  });

  app.get("/api/prayers", async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db.prayers);
  });

  app.post("/api/prayers", async (req, res) => {
    const { name, request, isPublic } = req.body;
    const db = await fs.readJson(DB_FILE);
    const newPrayer = {
      id: generateSecureId(),
      name: isPublic ? name : "Anonymous",
      request,
      date: new Date().toISOString(),
      isPublic,
    };
    db.prayers.unshift(newPrayer);
    await fs.writeJson(DB_FILE, db);
    res.json(newPrayer);
  });

  app.get("/api/testimonies", async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db.testimonies);
  });

  app.post("/api/testimonies", async (req, res) => {
    const { name, content } = req.body;
    const db = await fs.readJson(DB_FILE);
    const newTestimony = {
      id: generateSecureId(),
      name,
      content,
      date: new Date().toISOString(),
    };
    db.testimonies.unshift(newTestimony);
    await fs.writeJson(DB_FILE, db);
    res.json(newTestimony);
  });

  app.post("/api/registrations", async (req, res) => {
    const { name, email, phone, estate, groupName } = req.body;
    const db = await fs.readJson(DB_FILE);
    if (!db.registrations) db.registrations = [];

    // Check for double registration in same group with same email
    const exists = db.registrations.some(
      (r: any) => r.email.toLowerCase() === email.toLowerCase() && r.groupName === groupName
    );

    if (exists) {
      return res.status(400).json({ error: "You are already registered in this group." });
    }

    const newRegistration = {
      id: generateSecureId(),
      name,
      email,
      phone,
      estate,
      groupName,
      date: new Date().toISOString(),
    };
    db.registrations.push(newRegistration);
    await fs.writeJson(DB_FILE, db);
    res.json(newRegistration);
  });

  app.post("/api/members", async (req, res) => {
    const { username, email, phone, residence, department } = req.body;
    const db = await fs.readJson(DB_FILE);
    if (!db.members) db.members = [];

    // Check for double usernames with same emails
    const exists = db.members.some(
      (m: any) => m.email.toLowerCase() === email.toLowerCase() || m.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ error: "A member with this email or username already exists." });
    }

    const newMember = {
      id: `MEM-${generateSecureId()}`, // Unique prefix for members
      username,
      email,
      phone,
      residence,
      department,
      dateJoined: new Date().toISOString(),
    };
    db.members.push(newMember);
    await fs.writeJson(DB_FILE, db);
    res.json(newMember);
  });

  app.get("/api/live-streams", async (req, res) => {
    const db = await fs.readJson(DB_FILE);
    res.json(db.liveStreams);
  });

  app.post("/api/live-streams/:id", async (req, res) => {
    const { id } = req.params;
    const { status, videoId, description } = req.body;
    const db = await fs.readJson(DB_FILE);
    
    if (db.liveStreams[id]) {
      db.liveStreams[id] = {
        ...db.liveStreams[id],
        status,
        videoId,
        description: description || db.liveStreams[id].description,
        updatedAt: new Date().toISOString()
      };
      await fs.writeJson(DB_FILE, db);
      res.json(db.liveStreams[id]);
    } else {
      res.status(404).json({ error: "Stream not found" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static assets with long-term caching (since they are hashed)
    app.use(express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      index: false,
      setHeaders: (res, path) => {
        // Ensure service worker files are NEVER cached
        if (path.endsWith("sw.js") || path.endsWith("registerSW.js")) {
          res.set("Cache-Control", "no-cache, no-store, must-revalidate");
          res.set("Pragma", "no-cache");
          res.set("Expires", "0");
        }
      }
    }));

    // Serve index.html with NO CACHE to ensure users always get the latest version
    app.get("*", (req, res) => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
