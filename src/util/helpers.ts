import {
	Release,
	ReleaseDetails,
	ReleaseDetailsResponse,
	SearchType,
	UserCollectionItem,
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
								return [...acc, artist.name];
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
	comparator: number,
): Promise<Array<T>> => {
	return array.reduce((accumulator, currVal) => {
		if (currVal[iteratee] === comparator) accumulator.push(currVal);
		else if (
			!accumulator.find((obj: any) => obj[iteratee] === currVal[iteratee])
		) {
			accumulator.push(currVal);
		}
		return accumulator;
	}, [] as Array<T>);
};
