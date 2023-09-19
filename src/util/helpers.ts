import {
	Release,
	ReleaseDetails,
	ReleaseDetailsResponse,
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
	} = release;
	const labels = releaseLabels.map((label) => removeParentheses(label.name));

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
