import { z, ZodError } from "zod";

describe("zod", () => {
  describe("priority", () => {
    const schema = z.object({
      password: z
        .string()
        .min(8)
        .max(16)
        .refine((data) => data.match(/[a-z]/g) && data.match(/[A-Z]/g), {
          message: "password must include capital letter and small letter.",
        })
        .refine((data) => data.match(/[0-9]/g) && data.match(/[a-zA-Z]/g), {
          message: "password must include alphanumeric.",
        })
        .refine(
          (data) =>
            // https://javascript.info/regexp-escaping
            // https://javascript.info/regexp-character-sets-and-ranges#escaping-in-
            data.match(/[!"#\$%&'\(\)\*\+\-\.,\/:;<=>\?@\[\\\]\^_`{\|}~]/g),
          {
            message: "password must include special character.",
          }
        ),
    });
    it("should be passed", () => {
      try {
        schema.parse(
          "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901"
        );
      } catch (err) {
        expect(err as ZodError).toEqual({});
      }
    });
  });
});
