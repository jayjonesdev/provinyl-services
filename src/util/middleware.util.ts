import { NextFunction, Router, Request, Response } from 'express';
import cors from 'cors';
import parser from 'body-parser';
import compression from 'compression';
import { resolve } from 'path';
import { config } from 'dotenv';

config({ path: resolve(__dirname, '../../.env') });

const { CLIENT_URL } = process.env;

type Wrapper = (router: Router) => void;

export const applyMiddleware = (
	middlewareWrappers: Wrapper[],
	router: Router,
) => {
	for (const wrapper of middlewareWrappers) {
		wrapper(router);
	}
};

export const handleCors = (router: Router) =>
	router.use(
		cors({
			methods: 'GET,HEAD,POST,PATCH,DELETE,OPTIONS,PUT',
			credentials: true,
			allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
			origin: [CLIENT_URL],
		}),
	);

export const handleBodyRequestParsing = (router: Router) => {
	router.use(parser.json({ limit: '50mb' }));
	router.use(parser.urlencoded({ limit: '50mb', extended: true }));
};

export const handleCompression = (router: Router) => {
	router.use(compression());
};

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
	const accessToken = req.headers.authorization;
	const allowedPaths = ['auth', 'public'];

	if (
		accessToken ||
		req.path.includes('/auth') ||
		req.path.includes('public')
	) {
		next();
	} else {
		res.sendStatus(401);
	}
};

declare const process: {
	env: {
		CLIENT_URL: string;
	};
};
