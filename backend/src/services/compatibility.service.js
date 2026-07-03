import axios from "axios";
import CompatibilityScore from "../models/CompatibilityScore.js";


const computeFallbackScore = (profile, listing) => {
  const reasons = [];
  const budgetRange = profile.maxBudget - profile.minBudget;
  const normalizedBudget =
    budgetRange > 0 ? (listing.rent - profile.minBudget) / budgetRange : 0;
  const budgetScore = Math.round(
    50 * Math.max(0, Math.min(1, 1 - normalizedBudget)),
  );

  if (listing.rent >= profile.minBudget && listing.rent <= profile.maxBudget) {
    reasons.push("Rent is within your budget range");
  } else if (listing.rent < profile.minBudget) {
    reasons.push(
      "Rent is below your minimum budget, which may still be affordable",
    );
  } else {
    reasons.push("Rent is above your preferred budget range");
  }

  const profileLoc = profile.preferredLocation.toLowerCase();
  const listingLoc = listing.location.toLowerCase();
  const locationMatch =
    listingLoc.includes(profileLoc) || profileLoc.includes(listingLoc);
  const locationScore = locationMatch ? 50 : 20;

  if (locationMatch) {
    reasons.push("Location matches your preference");
  } else {
    reasons.push("Location does not match your preferred area");
  }

  const score = Math.round(
    Math.max(0, Math.min(100, budgetScore + locationScore)),
  );

  return {
    score,
    explanation: reasons.join(". ") + ".",
  };
};


export const getCompatibilityScore = async (
  tenantId,
  listingId,
  profile,
  listing,
) => {
  console.log("🤖 SCORING SERVICE CALLED:", { tenantId, listingId });


  const cached = await CompatibilityScore.findOne({ tenantId, listingId });
  if (cached) {
    console.log("💾 CACHE HIT:", { score: cached.score });
    return {
      score: cached.score,
      explanation: cached.explanation,
      cached: true,
    };
  }

  console.log("🔄 NO CACHE - Computing new score...");
  let result;

  try {
    console.log("📡 Calling Groq LLM...");
    const response = await axios.post(/* ... existing config ... */);
    console.log(
      "✅ LLM Response Received:",
      response.data.choices[0].message.content,
    );

    const parsed = JSON.parse(response.data.choices[0].message.content);
    result = {
      score: Math.min(100, Math.max(0, Math.round(parsed.score))),
      explanation: parsed.explanation,
    };
  } catch (error) {
    console.error("❌ LLM FAILED:", error.message);
    console.log("🔧 Using rule-based fallback...");
    result = computeFallbackScore(profile, listing);
    console.log("✅ Fallback Result:", result);
  }

  // Save to DB
  await CompatibilityScore.findOneAndUpdate(
    { tenantId, listingId },
    { ...result, computedAt: new Date() },
    { upsert: true, returnDocument: "after" },
  );

  console.log("💾 Score saved to DB:", result.score);
  return { ...result, cached: false };
};
