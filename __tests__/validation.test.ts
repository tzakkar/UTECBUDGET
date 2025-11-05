import { mapStatusStringToEnum, parseNumeric, parseInteger } from "../lib/validation"

describe("Validation utilities", () => {
  describe("mapStatusStringToEnum", () => {
    it("should map 'Completed' to COMPLETED", () => {
      expect(mapStatusStringToEnum("Completed")).toBe("COMPLETED")
    })

    it("should map 'Partially Completed' to PARTIAL", () => {
      expect(mapStatusStringToEnum("Partially Completed")).toBe("PARTIAL")
    })

    it("should map 'In Progress' to IN_PROGRESS", () => {
      expect(mapStatusStringToEnum("In Progress")).toBe("IN_PROGRESS")
    })

    it("should default to NOT_STARTED for unknown status", () => {
      expect(mapStatusStringToEnum("Unknown")).toBe("NOT_STARTED")
      expect(mapStatusStringToEnum(null)).toBe("NOT_STARTED")
      expect(mapStatusStringToEnum(undefined)).toBe("NOT_STARTED")
    })
  })

  describe("parseNumeric", () => {
    it("should parse valid numbers", () => {
      expect(parseNumeric("123")).toBe(123)
      expect(parseNumeric(123)).toBe(123)
      expect(parseNumeric("123.45")).toBe(123.45)
    })

    it("should handle null/undefined", () => {
      expect(parseNumeric(null)).toBe(null)
      expect(parseNumeric(undefined)).toBe(null)
      expect(parseNumeric("")).toBe(null)
    })

    it("should clean currency strings", () => {
      expect(parseNumeric("$1,234.56")).toBe(1234.56)
    })
  })

  describe("parseInteger", () => {
    it("should parse and floor numbers", () => {
      expect(parseInteger("123")).toBe(123)
      expect(parseInteger(123.45)).toBe(123)
      expect(parseInteger("123.99")).toBe(123)
    })
  })
})

