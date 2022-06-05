import { z, ZodObject } from "zod";

export const assert = <T extends ZodObject<any>>(
  target: unknown,
  schema: T
): asserts target is z.infer<typeof schema> => {
  schema.parse(target);
};
