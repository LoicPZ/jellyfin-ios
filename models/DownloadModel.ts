/**
 * Copyright (c) 2025 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BaseItemDto } from '@jellyfin/sdk/lib/generated-client/models/base-item-dto';
import * as FileSystem from 'expo-file-system';
import { v4 as uuidv4 } from 'uuid';

export interface DownloadItem extends BaseItemDto {
	Id: string;
	ServerId: string;
}

interface MobxDownloadModel {
	itemId: string;
	serverId: string;
	serverUrl: string;
	apiKey: string;
	title?: string;
	filename: string;
	downloadUrl: string;
	isComplete: boolean;
	isNew: boolean;
}

export default class DownloadModel {
	isComplete = false;
	isDownloading = false;
	isNew = true;

	apiKey: string;
	readonly item: Readonly<DownloadItem>;
	/** The "play" session ID for reporting a download has stopped. */
	sessionId = uuidv4();
	serverUrl: string;

	filename: string;

	downloadUrl: string;

	constructor(
		item: DownloadItem,
		serverUrl: string,
		apiKey: string,
		filename: string,
		downloadUrl: string
	) {
		this.item = item;
		this.serverUrl = serverUrl;
		this.apiKey = apiKey;
		this.filename = filename;
		this.downloadUrl = downloadUrl;
	}

	/** @deprecated Use item.Id instead. */
	get itemId() {
		return this.item.Id;
	}

	get key() {
		return `${this.item.ServerId}_${this.item.Id}`;
	}

	get localFilename() {
		return this.filename.slice(0, this.filename.lastIndexOf('.')) + '.mp4';
	}

	get localPath() {
		return `${FileSystem.documentDirectory}${this.item.ServerId}/${this.item.Id}/`;
	}

	/** @deprecated Use item.ServerId instead. */
	get serverId() {
		return this.item.ServerId;
	}

	get title() {
		return this.item.Name || undefined;
	}

	get uri() {
		return this.localPath + encodeURI(this.localFilename);
	}

	getStreamUrl(deviceId: string, params?: Record<string, string>): URL {
		const streamParams = new URLSearchParams({
			deviceId,
			api_key: this.apiKey,
			playSessionId: this.sessionId,
			// TODO: add mediaSourceId to support alternate media versions
			videoCodec: 'hevc,h264',
			audioCodec: 'aac,mp3,ac3,eac3,flac,alac',
			maxAudioChannels: '6',
			// subtitleCodec: 'srt,vtt',
			// subtitleMethod: 'Encode',
			...params
		});
		return new URL(`${this.serverUrl}Videos/${this.item.Id}/stream.mp4?${streamParams.toString()}`);
	}
}

/** Helper function to migrate download models saved by mobx. */
export function fromStorageObject({
	itemId,
	serverId,
	title,
	serverUrl,
	apiKey,
	filename,
	downloadUrl,
	isComplete,
	isNew
}: MobxDownloadModel): DownloadModel {
	const model = new DownloadModel(
		{
			Id: itemId,
			ServerId: serverId,
			Name: title
		},
		serverUrl,
		apiKey,
		filename,
		downloadUrl
	);
	model.isComplete = isComplete;
	model.isNew = isNew;
	return model;
}
