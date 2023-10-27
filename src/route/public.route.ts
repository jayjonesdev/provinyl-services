import { Router, Response, Request } from 'express';
import { Client as DiscogClient } from 'disconnect';
import {
	ReleaseDetailsResponse,
	UserCollectionItem,
	UserCollectionResponse,
	UserCollectionValue,
	Want,
} from '../util/types';
import { getUserReleases, parseReleaseDetails } from '../util/helpers';

const publicRoutes: Router = Router();

publicRoutes.get(
	'/public/user/:username/collection',
	async (req: Request, res: Response) => {
		const username = req.params.username;
		const accessToken = req.headers.authorization as string;
		const { DISCOGS_KEY, DISCOGS_SECRET } = process.env;

		let userCollection: UserCollectionItem[] = [];
		let discog = null;

		if (accessToken) {
			discog = new DiscogClient(JSON.parse(accessToken));
		} else {
			discog = new DiscogClient({
				consumerKey: DISCOGS_KEY,
				consumerSecret: DISCOGS_SECRET,
			});
		}

		let page = 0,
			pages = Number.MAX_SAFE_INTEGER;

		while (page < pages) {
			await getUserReleases(discog, username, page + 1).then(
				({ pages: maxPages, releases }) => {
					pages = maxPages;
					userCollection = [...userCollection, ...releases];
					page++;
				},
			);
		}
		return res.send({ pages, items: userCollection });
	},
);

publicRoutes.get(
	'/public/release/details/:id',
	async (req: Request, res: Response) => {
		const id = req.params.id;
		const accessToken = req.headers.authorization as string;
		const { DISCOGS_KEY, DISCOGS_SECRET } = process.env;

		let discog = null;

		if (accessToken) {
			discog = new DiscogClient(JSON.parse(accessToken));
		} else {
			discog = new DiscogClient({
				consumerKey: DISCOGS_KEY,
				consumerSecret: DISCOGS_SECRET,
			});
		}

		return await discog
			.database()
			.getRelease(id)
			.then((details: ReleaseDetailsResponse) => {
				const releaseDetails = parseReleaseDetails(details);
				return res.send(releaseDetails);
			});
	},
);

export default publicRoutes;

type IdentityType = {
	id: number;
	username: string;
	resource_url: string;
	consumer_name: string;
};
