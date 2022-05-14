import { z } from "zod";

const passwordSchema = z
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
  );

export const loginSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().nonempty(),
    newPassword: passwordSchema,
    confirmationPassword: passwordSchema,
  })
  .refine(
    (data) =>
      !data.confirmationPassword ||
      data.newPassword === data.confirmationPassword,
    {
      path: ["confirmationPassword"],
      message: "confirmationPassword does not match.",
    }
  );

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
}, z.date());

// `as const` must be needed, otherwise z.enum will show error.
const values = ["Salmon", "Tuna", "Trout"] as const;
export const enumSchema = z.enum(values);

const teacherBaseSchema = z.object({ students: z.array(z.string()) });
const hasIdSchema = z.object({ id: z.string() });
const teacherSchema = teacherBaseSchema.merge(hasIdSchema);
const alternativeTeacherSchema = teacherBaseSchema.extend(hasIdSchema.shape);
const noIdTeacherSchema = teacherSchema.omit({ id: true });
const alternativeNoIdTeacherSchema = teacherSchema.pick({ students: true });
const partialTeacherSchema = teacherSchema.partial();
const optionalIdTeacherSchema = teacherSchema.partial({ id: true });

const userSchema = z.object({
  username: z.string(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  strings: z.array(z.object({ value: z.string() })),
});
const deepPartialUserSchema = userSchema.deepPartial();

export const discriminatedUnionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("a"), a: z.string() }),
  z.object({ type: z.literal("b"), b: z.string() }),
]);
