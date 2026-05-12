import { plainToInstance, ClassConstructor } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError } from "@/common/utils/http-error";

/**
 * Transforms a plain payload into a validated DTO instance.
 * Throws `BadRequestError` with the flattened validation errors.
 */
export async function validateDto<T extends object>(
  cls: ClassConstructor<T>,
  payload: unknown,
): Promise<T> {
  const instance = plainToInstance(cls, payload ?? {}, { enableImplicitConversion: true });
  const errors = await validate(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: false,
    stopAtFirstError: false,
  });

  if (errors.length > 0) {
    const details = errors.map((e) => ({
      field: e.property,
      constraints: e.constraints,
    }));
    throw new BadRequestError("Validation failed", details);
  }

  return instance;
}
