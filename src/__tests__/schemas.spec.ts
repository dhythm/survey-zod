import { z, ZodError } from "zod";
import { changePasswordSchema, loginSchema } from "../schemas";

describe("zod", () => {
  describe("loginSchema", () => {
    it("should be passed", () => {
      expect(() =>
        loginSchema.parse({
          email: "test@example.com",
          password: "Password1!",
        })
      ).not.toThrowError();
    });
    it("should be failed", () => {
      try {
        loginSchema.parse({
          email: "",
          password:
            "12345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901",
        });
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
    });
  });

  describe("changePasswordSchema", () => {
    it("should be passed", () => {
      expect(() =>
        changePasswordSchema.parse({
          oldPassword: "Password1!",
          newPassword: "Password2!",
          confirmationPassword: "Password2!",
        })
      ).not.toThrowError();
    });
    it("should be failed", () => {
      try {
        changePasswordSchema.parse({
          oldPassword: "",
          newPassword: "Password2!",
          confirmationPassword: "Password1!",
        });
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
    });
  });

  describe("date", () => {
    const dateSchema = z.preprocess((arg) => {
      if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date());

    it("should be passed", () => {
      expect(() => dateSchema.parse(new Date("1/12/22"))).not.toThrowError();
      expect(() =>
        dateSchema.parse("2022-01-12T00:00:00.000Z")
      ).not.toThrowError();
    });
  });

  describe("enum", () => {
    // `as const` must be needed, otherwise z.enum will show error.
    const values = ["Salmon", "Tuna", "Trout"] as const;
    const enumSchema = z.enum(values);

    it("should be passed", () => {
      expect(enumSchema.options).toEqual(["Salmon", "Tuna", "Trout"]);
      expect(enumSchema.enum.Salmon).toBe("Salmon");
    });
  });

  describe("discriminatedUnion", () => {
    const discriminatedUnionSchema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.string() }),
    ]);

    it("should be passed", () => {
      expect(() =>
        discriminatedUnionSchema.parse({ type: "a", a: "abc" })
      ).not.toThrowError();
    });
    it("should be failed", () => {
      try {
        discriminatedUnionSchema.parse({
          type: "a",
          b: "abc",
        });
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
      try {
        discriminatedUnionSchema.parse({
          type: "b",
          a: "abc",
        });
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
    });
  });

  describe("promise", () => {
    const promiseSchema = z.promise(z.number());

    it("should be passed", async () => {
      expect(await promiseSchema.parse(Promise.resolve(3.14))).toBe(3.14);
      expect(promiseSchema.parse(Promise.resolve(3.14))).resolves.toBe(3.14);
    });
    it("should be failed", () => {
      expect(
        promiseSchema.parse(Promise.resolve("tuna"))
      ).rejects.toThrowError();
      expect(() => promiseSchema.parse(3.14)).toThrowError();
    });
  });

  describe("function", () => {
    const functionSchema = z
      .function()
      .args(z.string())
      .returns(z.number())
      .implement((x) => x.trim().length);

    it("should be passed", () => {
      expect(functionSchema("sandwich")).toBe(8);
      expect(functionSchema(" asdf ")).toBe(4);
    });
  });

  describe("preprocess", () => {
    // Typically Zod operates under a "parse then transform" paradigm.
    // Zod validates the input first, then passes it through a chain of transformation functions.
    const preprocessSchema = z.preprocess((v) => String(v), z.string());

    it("should be passed", () => {
      expect(preprocessSchema.parse(8)).toBe("8");
    });
  });

  describe("schema methods", () => {
    it("should be passed", async () => {
      expect(
        z
          .string()
          .refine(async (val) => val.length > 20)
          .parseAsync("hello, folks! it is awesome")
      ).resolves.toBe("hello, folks! it is awesome");
    });
    it("should be failed", () => {
      expect(
        z
          .string()
          .refine(async (val) => val.length > 20)
          .parseAsync("hello")
      ).rejects.toThrowError();
    });
  });

  describe("refine and superRefine", () => {
    const refineSchema = z
      .string()
      .transform((val) => val.length)
      .refine((val) => val > 25);
    const superRefineSchema = z.array(z.string()).superRefine((val, ctx) => {
      if (val.length > 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: 3,
          type: "array",
          inclusive: true,
          message: "Too many items 😡",
        });
      }

      if (val.length !== new Set(val).size) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `No duplicated allowed.`,
        });
      }
    });

    it("should be passed", () => {
      expect(refineSchema.parse("abcdefghijklmnopqrstuvwxyz")).toBe(26);
      expect(() => superRefineSchema.parse(["a", "b"])).not.toThrowError();
    });
    it("should be failed", () => {
      expect(() => refineSchema.parse("abc")).toThrowError();
      try {
        superRefineSchema.parse(["a", "b", "C", "d"]);
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
      try {
        superRefineSchema.parse(["a", "a", "b"]);
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
    });
  });

  describe("transform", () => {
    // CAVEAT:
    // Transform functions must not throw.
    // Make sure to use refinements before the transform or addIssue within the transform to make sure the input can be parsed by the transform.
    // https://github.com/colinhacks/zod#transform
    const transformValidationSchema = z.string().transform((val, ctx) => {
      const parsed = parseInt(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Not a number",
        });
      }
      return parsed;
    });
    const transformRefineSchema = z
      .string()
      .transform((val) => val.toUpperCase())
      .refine((val) => val.length < 15)
      .transform((val) => `Hello ${val}`)
      .refine((val) => val.indexOf("!") === -1);

    it("should be passed", () => {
      expect(
        z
          .string()
          .email()
          .transform((val) => val.split("@")[1])
          .parse("test@example.com")
      ).toBe("example.com");
      expect(transformValidationSchema.parse("16")).toBe(16);
      expect(transformRefineSchema.parse("World")).toBe("Hello WORLD");
    });

    it("should be failed", () => {
      try {
        expect(transformValidationSchema.parse("foo"));
      } catch (err) {
        expect(err as ZodError).toMatchSnapshot();
      }
      expect(() => transformRefineSchema.parse("World!")).toThrowError();
    });
  });

  describe("Error handling and error formatting", () => {
    it("should be passed", () => {});
    it("should be failed", () => {
      let data = z.object({ name: z.string() }).safeParse({ name: 12 });
      if (!data.success) {
        expect(data.error.issues).toMatchSnapshot();
        expect(data.error.format()).toMatchSnapshot();
      }
    });
  });

  describe("", () => {
    it("should be passed", () => {});
    it("should be failed", () => {});
  });
});
