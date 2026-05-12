import { ObjectId } from "mongodb";
import { BadRequestError } from "@/common/utils/http-error";

/** Safely coerces a value into a MongoDB ObjectId, or throws a 400. */
export function toObjectId(value: unknown, fieldName = "id"): ObjectId {
  if (value instanceof ObjectId) return value;
  if (typeof value !== "string" || !ObjectId.isValid(value)) {
    throw new BadRequestError(`Invalid ${fieldName}`);
  }
  return new ObjectId(value);
}
