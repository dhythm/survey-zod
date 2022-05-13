import { z, ZodError } from "zod";
import { changePasswordSchema, loginSchema } from "./schemas";

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
});
