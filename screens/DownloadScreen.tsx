/**
 * Copyright (c) 2025 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MediaType } from '@jellyfin/sdk/lib/generated-client/models/media-type';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, StyleSheet } from 'react-native';
import { Button, ThemeContext } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';

import DownloadListItem from '../components/DownloadListItem';
import ErrorView from '../components/ErrorView';
import { Screens } from '../constants/Screens';
import { useStores } from '../hooks/useStores';
import type DownloadModel from '../models/DownloadModel';

const DownloadScreen = () => {
	const navigation = useNavigation();
	const { downloadStore, mediaStore } = useStores();
	const { t } = useTranslation();
	const { theme } = useContext(ThemeContext);
	const [ isEditMode, setIsEditMode ] = useState(false);
	const [ selectedItems, setSelectedItems ] = useState<DownloadModel[]>([]);

	function exitEditMode() {
		setIsEditMode(false);
		setSelectedItems([]);
	}

	React.useLayoutEffect(() => {
		async function deleteItem(download: DownloadModel) {
			// TODO: Add user messaging on errors
			try {
				await FileSystem.deleteAsync(download.localPath);
				downloadStore.delete(download);
				console.log('[DownloadScreen] download "%s" deleted', download.title);
			} catch (e) {
				console.error('[DownloadScreen] Failed to delete download', e);
			}
		}

		function onDeleteItems(downloads: DownloadModel[]) {
			Alert.alert(
				t('alerts.deleteDownloads.title'),
				t('alerts.deleteDownloads.description'),
				[
					{
						text: t('common.cancel'),
						onPress: exitEditMode
					},
					{
						text: t('alerts.deleteDownloads.confirm', { downloadCount: downloads.length }),
						onPress: () => {
							// eslint-disable-next-line promise/catch-or-return
							Promise.all(downloads.map(deleteItem))
								.catch(err => {
									console.error('[DownloadScreen] failed to delete download', err);
								})
								.finally(exitEditMode);
						},
						style: 'destructive'
					}
				]
			);
		}

		navigation.setOptions({
			headerLeft: () => (
				isEditMode ?
					<Button
						title={t('common.cancel')}
						type='clear'
						onPress={exitEditMode}
						style={styles.leftButton}
					/> :
					null
			),
			headerRight: () => (
				isEditMode ?
					<Button
						title={t('common.delete')}
						type='clear'
						style={styles.rightButton}
						disabled={selectedItems.length < 1}
						onPress={() => {
							onDeleteItems(selectedItems);
						}}
					/> :
					<Button
						title={t('common.edit')}
						type='clear'
						style={styles.rightButton}
						disabled={downloadStore.downloads.size < 1}
						onPress={() => {
							setIsEditMode(true);
						}}
					/>
			)
		});
	}, [ navigation, isEditMode, selectedItems, downloadStore.downloads ]);

	useFocusEffect(
		useCallback(() => {
			downloadStore.downloads
				.forEach(download => {
					if (download.isNew && download.isNew !== !download.isComplete) {
						download.isNew = !download.isComplete;
						downloadStore.update(download);
					}
				});
		}, [ downloadStore.downloads ])
	);

	return (
		<SafeAreaView
			style={{
				...styles.container,
				backgroundColor: theme.colors?.background
			}}
			edges={[ 'right', 'left' ]}
		>
			{downloadStore.downloads.size > 0 ? (
				<FlatList
					data={Array.from(downloadStore.downloads.values())}
					extraData={downloadStore.downloads}
					renderItem={({ item, index }) => (
						<DownloadListItem
							item={item}
							index={index}
							isEditMode={isEditMode}
							isSelected={selectedItems.includes(item)}
							onSelect={() => {
								if (selectedItems.includes(item)) {
									setSelectedItems(selectedItems.filter(selected => selected !== item));
								} else {
									setSelectedItems([ ...selectedItems, item ]);
								}
							}}
							onPlay={async () => {
								item.isNew = false;
								mediaStore.set({
									isLocalFile: true,
									type: MediaType.Video,
									uri: item.uri
								});
							}}
						/>
					)}
					keyExtractor={(item, index) => `download-${index}-${item.key}`}
					contentContainerStyle={styles.listContainer}
				/>
			) : (
				<ErrorView
					icon={{
						name: 'download-circle-outline',
						type: 'material-community'
					}}
					heading={t('downloads.noDownloads.heading')}
					message={t('downloads.noDownloads.description')}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	listContainer: {
		marginTop: 1
	},
	leftButton: {
		marginLeft: 8
	},
	rightButton: {
		marginRight: 8
	}
});

DownloadScreen.displayName = Screens.DownloadsTab;

export default DownloadScreen;
