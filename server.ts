import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// JSON parser
app.use(express.json());

// Lazy-initialized nodemailer transport
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: host,
    port: parseInt(port, 10),
    secure: port === "465", // true for 465, false for other ports (like 587)
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false, // Avoid SSL certificate handshake issues
    },
  });
}

// Check SMTP Configuration API
app.get("/api/config-status", (req, res) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const configured = !!(host && user);
  res.json({
    configured,
    smtpUser: user || null,
  });
});

// API endpoint to send the email
app.post("/api/send-email", async (req, res) => {
  try {
    const { date, customMessage, isAngry } = req.body;
    const recipient = "yuceltaskin@outlook.com.tr";
    
    const subject = isAngry 
      ? "Fatih Bugün Sana Küs! 💔" 
      : "Fatih Bugün Sana Küs Değil! 😊";
    
    const mailText = isAngry 
      ? "fatih sana bugun kus" 
      : "fatih sana bugun kus degil";

    // Check if nodemailer is configured
    const transporter = getMailTransporter();
    
    if (!transporter) {
      console.log("SMTP not fully configured. Simulating success response.");
      return res.json({
        success: true,
        simulated: true,
        recipient,
        message: mailText,
        info: "SMTP credentials are not configured in environment variables. Email simulation success."
      });
    }

    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER || "fatihbaris@aistudio.com";
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${isAngry ? '#fff5f5' : '#fef8f8'}; padding: 40px; text-align: center; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 2px solid ${isAngry ? '#feb2b2' : '#fed7d7'}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="font-size: 48px; margin-bottom: 20px;">${isAngry ? '💔' : '🕊️'}</div>
        <h1 style="color: ${isAngry ? '#e53e3e' : '#2f855a'}; font-size: 26px; margin-bottom: 10px; font-weight: 700;">${isAngry ? 'Küslük İlan Edildi!' : 'Barış İmzalandı!'}</h1>
        <p style="color: #718096; font-size: 14px; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px;">${date || "Bugün"}</p>
        
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid ${isAngry ? '#fecaca' : '#fee2e2'}; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <p style="font-size: 18px; color: #2d3748; line-height: 1.6; margin: 0; font-weight: 500;">
            "${mailText}"
          </p>
          ${customMessage ? `<p style="font-size: 14px; color: #4a5568; font-style: italic; margin-top: 12px;">Not: ${customMessage}</p>` : ""}
        </div>
        
        <p style="color: #a0aec0; font-size: 13px; margin: 0;">
          Bu e-posta Fatih Bana Küstü mü? platformu üzerinden gönderilmiştir. ✨
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Fatih Bana Küstü mü?" <${fromAddress}>`,
      to: recipient,
      subject: subject,
      text: mailText,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: ", info.messageId);

    return res.json({
      success: true,
      simulated: false,
      recipient,
      messageId: info.messageId,
      message: mailText,
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "E-posta gönderilirken bir hata oluştu.",
    });
  }
});

// Vite / static routing setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
