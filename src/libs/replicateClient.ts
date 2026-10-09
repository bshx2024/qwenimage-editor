import Replicate from "replicate";

export const getReplicateClient = (customToken?: string) => {
  const token = customToken || process.env.REPLICATE_API_TOKEN;
  return new Replicate({
    auth: token,
  });
};
