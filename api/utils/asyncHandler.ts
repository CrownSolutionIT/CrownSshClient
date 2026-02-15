import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async express route handler to catch any errors and pass them to next().
 * This prevents unhandled promise rejections.
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
