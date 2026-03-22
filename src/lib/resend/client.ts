import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendDailyDigest({
  pendingCount,
  topics,
  pillar,
}: {
  pendingCount: number;
  topics: string[];
  pillar: string;
}) {
  const resend = getResend();
  await resend.emails.send({
    from: "Azen Content <content@azen.io>",
    to: ["tayyib@azen.io"],
    subject: `${pendingCount} posts ready for approval — ${pillar}`,
    html: `
      <div style="font-family: sans-serif; background: #0a0e1a; color: #fff; padding: 32px;">
        <h1 style="color: #00d4aa;">Good Morning, Tayyib</h1>
        <p style="color: #8892b0;">You have <strong style="color: #fff;">${pendingCount} posts</strong> ready for approval.</p>
        <p style="color: #8892b0;">Today's pillar: <strong style="color: #00d4aa;">${pillar}</strong></p>
        ${topics.length > 0 ? `
          <p style="color: #8892b0; margin-top: 16px;">Trending topics today:</p>
          <ul style="color: #ccc;">
            ${topics.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        ` : ""}
        <a href="https://your-dashboard-url.vercel.app" style="display: inline-block; background: #00d4aa; color: #0a0e1a; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px;">Open Dashboard</a>
      </div>
    `,
  });
}
