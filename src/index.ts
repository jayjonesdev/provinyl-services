require('module-alias/register');
import { resolve } from 'path';
import { config } from 'dotenv';
import express from 'express';
import 'reflect-metadata';
import cookieSession from 'cookie-session';
import { logger } from './service';
import { middleware } from './util';
import routes from './route';
import flash from 'connect-flash';
// import { checkAuth } from './util/middleware.util';

config({ path: resolve(__dirname, '../.env') });

const init = async () => {
	const {
		applyMiddleware,
		handleCors,
		handleBodyRequestParsing,
		handleCompression,
		checkAuth,
	} = middleware;

	await logger.init();

	const router: express.Application = express();
	router.set('trust proxy', 1);
	router.use(
		cookieSession({
			name: process.env.COOKIE_NAME,
			keys: [process.env.COOKIE_KEY],
			domain: process.env.COOKIE_DOMAIN, // https://stackoverflow.com/questions/1062963/how-do-browser-cookie-domains-work
			secure: process.env.COOKIE_SECURE === 'true' ? true : false,
			maxAge: 24 * 60 * 60, // Max time
		}),
	);

	applyMiddleware(
		[handleCors, handleBodyRequestParsing, handleCompression],
		router,
	);

	router.use(checkAuth);
	router.use(flash());
	router.use(routes);
	router.listen(process.env.PORT || undefined, () =>
		logger.log(
			'INFO',
			`Provinyl services started on port ${process.env.PORT}.`,
		),
	);
};

init();

declare const process: {
	env: {
		PORT: number;
		COOKIE_NAME: string;
		COOKIE_KEY: string;
		COOKIE_DOMAIN: string;
		COOKIE_HTTP_ONLY: string;
		COOKIE_SECURE: string;
		CLIENT_URL: string;
		COOKIE_SAME_SITE: boolean | 'strict' | 'lax' | 'none';
		NODE_ENV: string;
	};
	exit: (value: any) => void;
};
