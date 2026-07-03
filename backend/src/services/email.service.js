import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY not set. Skipping email.");
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (error) {
    // NEVER crash the API due to email failure
    console.error(`❌ Email failed to ${to}:`, error.message);
  }
};

// Pre-built notification templates
export const notifyOwnerOfHighInterest = async (
  ownerEmail,
  tenantName,
  listingTitle,
  score,
) => {
  await sendEmail({
    to: ownerEmail,
    subject: `🔥 High Compatibility Interest (${score}%) - ${tenantName}`,
    html: `
      <h2>New High-Compatibility Interest!</h2>
      <p><strong>${tenantName}</strong> expressed interest in your listing 
         <strong>"${listingTitle}"</strong> with a compatibility score of 
         <strong>${score}%</strong>.</p>
      <p>Log in to review and respond.</p>
    `,
  });
};

export const notifyTenantOfDecision = async (
  tenantEmail,
  ownerName,
  listingTitle,
  status,
) => {
  const accepted = status === "ACCEPTED";
  await sendEmail({
    to: tenantEmail,
    subject: `${accepted ? "✅" : "❌"} Interest ${status} - ${listingTitle}`,
    html: `
      <h2>${accepted ? "Your Interest Was Accepted!" : "Interest Update"}</h2>
      <p><strong>${ownerName}</strong> has <strong>${status.toLowerCase()}</strong> 
         your interest for <strong>"${listingTitle}"</strong>.</p>
      ${accepted ? "<p>You can now chat in real-time! Log in to start messaging.</p>" : ""}
    `,
  });
};
