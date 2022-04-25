import config from "@/services/ConfigService";
import expect from "expect";

describe("ConfigService", () => {
  describe("start up and load the default json file", () => {
    it("should start up with given init value", async () => {
      await config.startUp({ abc: "123" });
      expect(config.get("abc")).toBe("123");
    });
  });

  describe("set/get", () => {
    it("set and get a value", () => {
      config.set("key1", "123");
      expect(config.get("key1")).toBe("123");
    });
    it("throws error when key is not in config", () => {
      expect(() => {
        config.get("badkey");
      }).toThrowError();
    });
  });

  describe("require a value", () => {
    it("should throw error on non-existing key", () => {
      expect(() => {
        config.required(["key2"]);
      }).toThrow("ConfigService: missing required key(s): [key2]");
    });

    it("should accept existing key", () => {
      const result = config.required(["key1"]);
      expect(result).toBeUndefined();
    });
  });
});
