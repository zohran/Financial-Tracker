import { NextResponse } from "next/server";
import { HttpError } from "@/common/utils/http-error";

type SuccessBody<T> = { success: true; data: T };
type ErrorBody = { success: false; error: string; details?: unknown };

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<SuccessBody<T>>({ success: true, data }, { status });
}

export function fail(error: unknown) {
  if (error instanceof HttpError) {
    return NextResponse.json<ErrorBody>(
      { success: false, error: error.message, details: error.details },
      { status: error.status },
    );
  }

  // eslint-disable-next-line no-console
  console.error("[API] Unhandled error:", error);
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json<ErrorBody>({ success: false, error: message }, { status: 500 });
}
