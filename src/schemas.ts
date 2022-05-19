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

const personSchema = z.object({ name: z.string() });
const employeeSchema = z.object({ role: z.string() });
const employedPersonScheme = z.intersection(personSchema, employeeSchema);
// equivalent to: personSchema.and(employeeSchema)
// CAVEAT:
// Though in many cases, it is recommended to use A.merge(B) to merge two objects.
// The.merge method returns a new ZodObject instance, whereas A.and(B) returns a less useful ZodIntersection instance that lacks common object methods like pick and omit.
// https://github.com/colinhacks/zod#intersections

interface Category {
  name: string;
  subCategories: Category[];
}
const categorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({ name: z.string(), subCategories: z.array(categorySchema) })
);

// https://github.com/colinhacks/zod#json-type
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Json = z.infer<typeof literalSchema> | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

function makeSchemaOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}
function makeStringSchemaOptional<T extends z.ZodType<string>>(schema: T) {
  return schema.optional();
}
const arg = makeSchemaOptional(z.string());
makeStringSchemaOptional(z.string());
// makeStringSchemaOptional(z.number());

// const nameAndEmailSchema = z.object({
//   name: z.string(),
//   email: z.string().email(),
// });
const nameAndEmailSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .or(
    z.object({
      name: z.literal(""),
      email: z.literal(""),
    })
  );
const alternativeNameAndEmailSchema = z.union([
  z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  z.object({
    name: z.literal(""),
    email: z.literal(""),
  }),
]);

export const nameAndEmailArraySchema = z.array(nameAndEmailSchema);
