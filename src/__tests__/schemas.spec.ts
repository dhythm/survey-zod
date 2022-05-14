import { z, ZodError } from "zod";
import {
  changePasswordSchema,
  dateSchema,
  discriminatedUnionSchema,
  enumSchema,
  loginSchema,
} from "./schemas";

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

  describe("dateSchema", () => {
    it("should be passed", () => {
      expect(() => dateSchema.parse(new Date("1/12/22"))).not.toThrowError();
      expect(() =>
        dateSchema.parse("2022-01-12T00:00:00.000Z")
      ).not.toThrowError();
    });
  });

  describe("dateSchema", () => {
    it("should be passed", () => {
      expect(enumSchema.options).toEqual(["Salmon", "Tuna", "Trout"]);
      expect(enumSchema.enum.Salmon).toEqual("Salmon");
    });
  });

  describe("discriminatedUnionSchema", () => {
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

  describe("", () => {
    it("should be passed", () => {});
    it("should be failed", () => {});
  });
});
