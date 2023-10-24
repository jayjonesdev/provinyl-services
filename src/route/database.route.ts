import { Router, Response, Request } from 'express';
import { Client as DiscogClient } from 'disconnect';
import {
	getSearchType,
	removeDuplicates,
	removeParentheses,
	uniqByWithComparator,
} from '../util/helpers';
import {
	DatabaseSearchResponse,
	SearchRelease,
	SearchType,
} from '../util/types';

const database: Router = Router();

database.get(
	'/database/search/:query/type/:type',
	async (req: Request, res: Response) => {
		const accessToken = req.headers.authorization as string;
		const query = req.params.query;
		const type = req.params.type as unknown as SearchType;
		const searchType = getSearchType(type);

		const discog = new DiscogClient(JSON.parse(accessToken));
		return await discog
			.database()
			.search({
				format: 'Vinyl',
				type: 'release',
				per_page: '100',
				[searchType]: query,
			})
			.then(async (data: DatabaseSearchResponse) => {
				const releases = await uniqByWithComparator<SearchRelease>(
					data.results,
					'master_id',
					0,
				).then((releases) =>
					releases.map((release) => {
						const {
							title: releaseTitle,
							year,
							label,
							genre,
							cover_image,
							catno,
							id,
							country,
						} = release;
						const [artist, title] = releaseTitle.split(' - ');

						return {
							artist: removeParentheses(artist),
							title,
							year,
							labels: removeDuplicates(label).slice(0, 2).join(', '),
							genres: removeDuplicates(genre).slice(0, 2).join(', '),
							imageUrl: cover_image,
							catno,
							releaseId: id.toString(),
							country,
						};
					}),
				);

				return res.send(releases);
			});
	},
);

export default database;
