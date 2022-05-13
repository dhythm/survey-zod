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
