import { DateRangePreset } from "@/common/enums/date-range.enum";
import { BadRequestError } from "@/common/utils/http-error";

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Resolves a date-range preset (or an explicit from/to pair) into concrete Dates.
 * Accepts ISO strings (YYYY-MM-DD or full ISO datetime).
 */
export function resolveDateRange(params: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}): DateRange | null {
  const now = new Date();

  if (params.preset) {
    switch (params.preset) {
      case DateRangePreset.TODAY: {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return { from: start, to: now };
      }
      case DateRangePreset.LAST_7_DAYS: {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { from: start, to: now };
      }
      case DateRangePreset.LAST_30_DAYS: {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        return { from: start, to: now };
      }
      case DateRangePreset.THIS_MONTH: {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return { from: start, to: now };
      }
      case DateRangePreset.CUSTOM:
        break;
      default:
        throw new BadRequestError(`Unknown date range preset: ${params.preset}`);
    }
  }

  if (params.from || params.to) {
    const from = params.from ? new Date(params.from) : new Date(0);
    const to = params.to ? new Date(params.to) : new Date();
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestError("Invalid from/to date");
    }
    if (from > to) {
      throw new BadRequestError("'from' must be before 'to'");
    }
    return { from, to };
  }

  return null;
}
