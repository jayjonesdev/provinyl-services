export interface UserCollectionResponse {
	pagination: Pagination;
	releases: Release[];
}

export interface Pagination {
	items: number;
	page: number;
	pages: number;
}

export interface Release {
	id: number;
	instance_id: number;
	basic_information: BasicInformation;
}

export interface BasicInformation {
	id: number;
	master_id: number;
	master_url: string;
	resource_url: string;
	thumb: string;
	cover_image: string;
	title: string;
	year: number;
	formats: Format[];
	labels: Label[];
	artists: Artist[];
	genres: string[];
	styles: string[];
}

export interface Label {
	name: string;
	catno: string;
	entity_type: string;
	entity_type_name: string;
	id: number;
	resource_url: string;
}

export interface Artist {
	name: string;
	anv: string;
	join: string;
	role: string;
	tracks: string;
	id: number;
	resource_url: string;
}

export interface Format {
	name: string;
	qty: string;
	descriptions: string[];
}

export interface UserCollection {
	pages: number;
	items: UserCollectionItem[];
}

export interface UserCollectionItem {
	title: string;
	artist: string;
	year: number;
	labels: string;
	genres: string;
	catno: string;
	releaseId: number;
	imageUrl: string;
	instanceId: number;
}

export interface UserCollectionValue {
	minimum: string;
	median: string;
	maximum: string;
}

export interface ReleaseDetailsResponse {
	artists: Artist[];
	genres: string[];
	id: number;
	images: Image[];
	labels: Label[];
	master_id: number;
	master_url: string;
	released_formatted: string;
	title: string;
	tracklist: Track[];
	uri: string;
	year: number;
	videos: Video[];
}

export interface Image {
	type: 'primary' | 'secondary';
	height: number;
	uri: string;
	uri50: string;
	width: number;
}

export interface Track {
	duration: string;
	position: string;
	title: string;
	extraartists: Artist[];
}

export interface Video {
	description: string;
	duration: number;
	embed: boolean;
	title: string;
	uri: string;
}

export interface ReleaseDetails {
	title: string;
	artist: string;
	genres: string;
	releaseDate: string;
	id: number;
	coverArtUri: string;
	labels: string;
	uri: string;
	year: number;
	trackList: ReleaseTrack[];
	musicVideos: Video[];
}

export interface ReleaseTrack {
	duration: string;
	position: string;
	title: string;
	featuredArtists: string;
}

export enum SearchType {
	CATALOG_NUMBER = 'CATALOG_NUMBER',
	BARCODE = 'BARCODE',
	ALBUM_TITLE = 'ALBUM_TITLE',
	ARTIST = 'ARTIST',
	TRACK = 'TRACK',
}

export interface DatabaseSearchResponse {
	pagination: any;
	results: SearchRelease[];
}
/**
 * 
 * {
    "page": 1,
    "pages": 4,
    "per_page": 100,
    "items": 315,
    "urls": {
        "last": "https://api.discogs.com/database/search?artist=A+Tribe+Called+Quest&format=Vinyl&type=release&per_page=100&page=4",
        "next": "https://api.discogs.com/database/search?artist=A+Tribe+Called+Quest&format=Vinyl&type=release&per_page=100&page=2"
    }
}
 */

export interface SearchRelease {
	title: string;
	year: number;
	label: string[];
	catno: string;
	genre: string[];
	cover_image: string;
	id: number;
	country: string;
}
