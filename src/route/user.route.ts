import { Router, Response, Request } from 'express';
import { Client as DiscogClient } from 'disconnect';
import {
	UserCollectionItem,
	UserCollectionResponse,
	UserCollectionValue,
	Want,
} from '../util/types';
import { parseReleases, parseWants } from '../util/helpers';

const user: Router = Router();

// TODO: Handle Error
user.get('/user/info', (req: Request, res: Response) => {
	const accessToken = req.headers.authorization as string;

	const discog = new DiscogClient(JSON.parse(accessToken));
	discog.getIdentity((err: Error, identity: IdentityType) => {
		return res.send(identity);
	});
});

user.get('/user/:username/collection', async (req: Request, res: Response) => {
	const username = req.params.username;
	const accessToken = req.headers.authorization as string;
	let userCollection: UserCollectionItem[] = [];

	const discog = new DiscogClient(JSON.parse(accessToken));
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
});

user.get('/user/:username/wantlist', async (req: Request, res: Response) => {
	const username = req.params.username;
	const accessToken = req.headers.authorization as string;
	let userWantList: UserCollectionItem[] = [];

	const discog = new DiscogClient(JSON.parse(accessToken));
	let page = 0,
		pages = Number.MAX_SAFE_INTEGER;

	while (page < pages) {
		await getUserWantListReleases(discog, username, page + 1).then(
			({ pages: maxPages, wants }) => {
				pages = maxPages;
				userWantList = [...userWantList, ...wants];
				page++;
			},
		);
	}
	return res.send(userWantList);
});

user.get(
	'/user/:username/collection/value',
	async (req: Request, res: Response) => {
		const username = req.params.username;
		const accessToken = req.headers.authorization as string;

		const discog = new DiscogClient(JSON.parse(accessToken));

		return await discog
			.get(`/users/${username}/collection/value`)
			.then((data: UserCollectionValue) => res.send(data.median));
	},
);
// TODO: Add middleware to handle no access token
user.delete(
	'/user/:username/collection/release/:releaseid/instance/:instanceid',
	async (req: Request, res: Response) => {
		const username = req.params.username;
		const releaseId = req.params.releaseid;
		const instanceId = req.params.instanceid;
		const accessToken = req.headers.authorization as string;

		const discog = new DiscogClient(JSON.parse(accessToken));

		return await discog
			.user()
			.collection()
			.removeRelease(username, 0, releaseId, instanceId)
			.then(() => res.send(true));
	},
);

user.post(
	'/user/:username/collection/release/:releaseid',
	async (req: Request, res: Response) => {
		const username = req.params.username;
		const releaseId = req.params.releaseid;
		const accessToken = req.headers.authorization as string;

		const discog = new DiscogClient(JSON.parse(accessToken));

		return await discog
			.user()
			.collection()
			.addRelease(username, 0, releaseId)
			.then(({ instance_id }: { instance_id: number }) => {
				console.log(instance_id);
				return res.send(instance_id.toString()).sendStatus(200);
			});
	},
);

const getUserReleases = async (
	discog: any,
	username: string,
	page: number,
): Promise<{ pages: number; releases: any[] }> => {
	return await discog
		.user()
		.collection()
		.getReleases(username, 0, {
			page,
			per_page: 500,
			sort: 'artist',
			sort_order: 'asc',
		})
		.then((data: UserCollectionResponse) => {
			return {
				pages: data.pagination.pages,
				releases: parseReleases(data.releases),
			};
		});
};

const getUserWantListReleases = async (
	discog: any,
	username: string,
	page: number,
): Promise<{ pages: number; wants: any[] }> => {
	return await discog
		.user()
		.wantlist()
		.getReleases(username, {
			page,
			per_page: 500,
			sort: 'artist',
			sort_order: 'asc',
		})
		.then((data: { pagination: any; wants: Want[] }) => {
			return {
				pages: data.pagination.pages,
				wants: parseWants(data.wants),
			};
		});
};

export default user;

type IdentityType = {
	id: number;
	username: string;
	resource_url: string;
	consumer_name: string;
};
