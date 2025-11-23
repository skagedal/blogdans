import z from "zod";

const featureVersion = z.enum(["next", "current"]);
const searchParamsSchema = z.object({
  version: featureVersion.optional(),
});
const processEnvSchema = z.object({
  BLOGDANS_VERSION: featureVersion.optional(),
});

export type FeatureManagementSearchParams = z.infer<typeof searchParamsSchema>;

export type Features = {
  showComments: boolean;
};

const parsedProcessEnv = processEnvSchema.parse(process.env);

export async function getFeatures(searchParams: FeatureManagementSearchParams) {
  const parsedSearchParams = searchParamsSchema.parse(searchParams);
  const actingVersion = parsedSearchParams.version || parsedProcessEnv.BLOGDANS_VERSION || "current";
  const features: Features = {
    showComments: actingVersion === "next",
  };

  return features;
}
