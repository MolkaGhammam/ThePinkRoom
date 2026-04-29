export const ACQUISITION_CHANNELS = [
  "instagram",
  "facebook",
  "whatsapp",
  "walkin",
  "referral",
  "other",
] as const;

export type AcquisitionChannel = (typeof ACQUISITION_CHANNELS)[number];
