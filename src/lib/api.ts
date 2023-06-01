import type { Context } from "hono";
import { ZodError } from "zod";

interface ApiPayload {
  success: boolean;
  messages: string[];
  data: object;
}

interface BaseApiResponseProps {
  c: Context;
  status?: number;
}

interface SuccessApiResponseProps extends BaseApiResponseProps {
  message?: string;
  data?: object;
}

interface ErrorApiResponseProps extends BaseApiResponseProps {
  error: Error | ZodError | unknown;
}

export const apiResponse = {
  success({ c, status = 200, message, data = {} }: SuccessApiResponseProps) {
    const payload: ApiPayload = {
      success: true,
      messages: message ? [message] : [],
      data,
    };

    return c.json(payload, status);
  },

  error({ c, status = 500, error }: ErrorApiResponseProps) {
    if (!(error instanceof Error)) return new Response();

    const messages =
      error instanceof ZodError
        ? error.errors.map(zodError => zodError.message)
        : [error.message];

    const payload: ApiPayload = {
      success: false,
      messages,
      data: {},
    };

    return c.json(payload, status);
  },
};
