import {
	Release,
	ReleaseDetails,
	ReleaseDetailsResponse,
	SearchType,
	UserCollectionItem,
	UserCollectionResponse,
	Want,
} from './types';

export const removeDuplicates = (arr: any[]): any[] => [...new Set(arr)];
export const removeParentheses = (str: string): string =>
	str.toString().replace(/ *\([^)]*\) */g, '');

export const parseReleaseDetails = (
	release: ReleaseDetailsResponse,
): ReleaseDetails => {
	const {
		title,
		artists,
		genres,
		released_formatted,
		id,
		images,
		labels: releaseLabels,
		uri,
		year,
		tracklist,
		videos,
	} = release;
	const labels = releaseLabels.map((label) => removeParentheses(label.name));
	const tracks = tracklist.map(
		({ duration, extraartists, position, title }) => ({
			duration,
			title,
			position,
			featuredArtists: extraartists
				? extraartists
						.reduce((acc, artist) => {
							if (artist.role === 'Featuring') {
								return [...acc, removeParentheses(artist.name)];
							}
							return acc;
						}, [] as string[])
						.join(', ')
				: '',
		}),
	);

	return {
		title,
		artist: artists[0].name,
		genres: genres.join(', '),
		releaseDate: released_formatted,
		id,
		coverArtUri: images ? images.map((image) => image.uri)[0] : '',
		labels: removeDuplicates(labels).join(', '),
		uri,
		year,
		trackList: tracks,
		musicVideos: videos,
	};
};

export const parseReleases = (releases: Release[]): UserCollectionItem[] => {
	return releases.reduce((acc, release) => {
		const { basic_information } = release;
		const artist = basic_information.artists.map((artist) =>
			removeParentheses(artist.name),
		);
		const labels = basic_information.labels.map((label) =>
			removeParentheses(label.name),
		);
		const catno = basic_information.labels.map((label) => label.catno);

		return [
			...acc,
			{
				title: basic_information.title,
				artist: removeDuplicates(artist).join(', '),
				year: basic_information.year,
				labels: removeDuplicates(labels).join(', '),
				genres: basic_information.genres.join(', '),
				catno: removeDuplicates(catno).join(', '),
				releaseId: basic_information.id,
				imageUrl: basic_information.cover_image,
				instanceId: release.instance_id,
			},
		];
	}, [] as UserCollectionItem[]);
};

export const parseWants = (wants: Want[]): UserCollectionItem[] => {
	return wants.reduce((acc, want) => {
		const { basic_information, id } = want;
		const artist = basic_information.artists.map((artist) =>
			removeParentheses(artist.name),
		);
		const labels = basic_information.labels.map((label) =>
			removeParentheses(label.name),
		);
		const catno = basic_information.labels.map((label) => label.catno);

		return [
			...acc,
			{
				title: basic_information.title,
				artist: removeDuplicates(artist).join(', '),
				year: basic_information.year,
				labels: removeDuplicates(labels).join(', '),
				genres: basic_information.genres.join(', '),
				catno: removeDuplicates(catno).join(', '),
				releaseId: basic_information.id,
				imageUrl: basic_information.cover_image,
				instanceId: id,
				wantList: true,
			},
		];
	}, [] as UserCollectionItem[]);
};

export const getSearchType = (searchType: SearchType) => {
	switch (searchType) {
		case SearchType.ALBUM_TITLE:
			return 'title';
		case SearchType.ARTIST:
			return 'artist';
		case SearchType.TRACK:
			return 'track';
		case SearchType.BARCODE:
			return 'barcode';
		case SearchType.CATALOG_NUMBER:
			return 'catno';
		default:
			return 'title';
	}
};

export const uniqByWithComparator = async <T extends { [k: string]: any }>(
	array: Array<T>,
	iteratee: string,
): Promise<Array<T>> => {
	return array.reduce((accumulator, currVal) => {
		if (
			currVal[iteratee] !== 0 &&
			!accumulator.find((obj: any) => obj[iteratee] === currVal[iteratee])
		) {
			accumulator.push(currVal);
		}
		return accumulator;
	}, [] as Array<T>);
};

export const getUserReleases = async (
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

export const getUserWantListReleases = async (
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
