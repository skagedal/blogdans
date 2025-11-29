import z from "zod";
import { config } from "@/config";

const featureVersion = z.enum(["next", "current"]);
const searchParamsSchema = z.object({
  version: featureVersion.optional(),
});

export type FeatureManagementSearchParams = z.infer<typeof searchParamsSchema>;

export type Features = {
  showComments: boolean;
};

export async function getFeatures(searchParams: FeatureManagementSearchParams) {
  const parsedSearchParams = searchParamsSchema.parse(searchParams);
  const actingVersion = parsedSearchParams.version || config.featureVersion || "current";
  const features: Features = {
    // Feature flag enabled for everyone at 2025-11-23
    showComments: actingVersion === "next" || actingVersion === "current",
  };

  return features;
}
