import { Router, Response, Request } from 'express';
import { Client as DiscogClient } from 'disconnect';
import { ReleaseDetailsResponse } from '../util/types';
import { parseReleaseDetails } from '../util/helpers';

export const release: Router = Router();

release.get('/release/details/:id', async (req: Request, res: Response) => {
	const id = req.params.id;
	const accessToken = req.headers.authorization;

	if (accessToken) {
		const discog = new DiscogClient(JSON.parse(accessToken));

		return await discog
			.database()
			.getRelease(id)
			.then((details: ReleaseDetailsResponse) => {
				// console.log(details);
				const releaseDetails = parseReleaseDetails(details);
				return res.send(releaseDetails);
			});
	}
	return res.send(false);
});

export default release;
