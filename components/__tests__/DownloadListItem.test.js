/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

/* eslint-disable react/prop-types, react/display-name, no-shadow */
import DownloadModel from '../../models/DownloadModel';
import DownloadListItem from '../DownloadListItem';

// Mock RNE ListItem to avoid Animated internals in Jest 29/RN 0.79
jest.mock('react-native-elements', () => {
	const actual = jest.requireActual('react-native-elements');
	const React = require('react');
	const { View, Text } = require('react-native');
	const ListItem = ({ children, onPress, testID }) => (
		React.createElement(Text, { onPress, testID }, children)
	);
	ListItem.Content = ({ children }) => React.createElement(View, { testID: 'list-content' }, children);
	ListItem.Title = ({ children, testID }) => React.createElement(Text, { testID }, children);
	ListItem.Subtitle = ({ children, testID }) => React.createElement(Text, { testID }, children);
	ListItem.CheckBox = ({ testID, onPress }) => React.createElement(Text, { testID, onPress });
	const Button = ({ onPress, testID }) => React.createElement(Text, { onPress, testID });
	return { ...actual, ListItem, Button };
});

describe('DownloadListItem', () => {
	let model;

	beforeEach(() => {
		jest.resetModules();

		model = new DownloadModel(
			{
				Id: 'item-id',
				ServerId: 'server-id',
				Name: 'title'
			},
			'https://example.com/',
			'api-key',
			'file name.mkv',
			'https://example.com/download'
		);
	});

	it('should render correctly', () => {
		const onPlay = jest.fn();
		const onSelect = jest.fn();

		const { getByTestId, queryByTestId } = render(
			<DownloadListItem
				item={model}
				index={0}
				onSelect={onSelect}
				onPlay={onPlay}
				onDelete={() => { /* no-op */ }}
			/>
		);

		expect(queryByTestId('select-checkbox')).toBeNull();

		expect(getByTestId('title')).toHaveTextContent('title');
		expect(getByTestId('subtitle')).toHaveTextContent('file name.mp4');

		expect(queryByTestId('loading-indicator')).not.toBeNull();
	});

	it('should display the menu and handle presses', () => {
		const onPlay = jest.fn();
		const onDelete = jest.fn();

		model.isComplete = true;

		const { getByTestId, queryByTestId } = render(
			<DownloadListItem
				item={model}
				index={0}
				onSelect={() => { /* no-op */ }}
				onPlay={onPlay}
				onDelete={onDelete}
			/>
		);

		expect(queryByTestId('select-checkbox')).toBeNull();

		expect(getByTestId('title')).toHaveTextContent('title');
		expect(getByTestId('subtitle')).toHaveTextContent('file name.mp4');

		expect(queryByTestId('loading-indicator')).toBeNull();

		// Pressing the list item should call onPlay when not editing
		expect(onPlay).not.toHaveBeenCalled();
		fireEvent.press(getByTestId('list-item'));
		expect(onPlay).toHaveBeenCalledTimes(1);
		// Pressing the play menu action should call onPlay
		expect(queryByTestId('play_in_app')).not.toBeNull();
		fireEvent.press(getByTestId('play_in_app'));
		expect(onPlay).toHaveBeenCalledTimes(2);
		// Pressing the delete menu action should call onDelete
		expect(onDelete).not.toHaveBeenCalled();
		expect(queryByTestId('delete')).not.toBeNull();
		fireEvent.press(getByTestId('delete'));
		expect(onDelete).toHaveBeenCalled();
	});

	it('should display the select checkbox and handle presses', () => {
		const onSelect = jest.fn();

		model.isComplete = true;

		const { getByTestId, queryByTestId } = render(
			<DownloadListItem
				item={model}
				index={0}
				onSelect={onSelect}
				onPlay={() => { /* no-op */ }}
				isEditMode={true}
			/>
		);

		expect(queryByTestId('select-checkbox')).not.toBeNull();

		expect(getByTestId('title')).toHaveTextContent('title');
		expect(getByTestId('subtitle')).toHaveTextContent('file name.mp4');

		expect(queryByTestId('loading-indicator')).toBeNull();

		expect(onSelect).not.toHaveBeenCalled();

		// Pressing the list item and checkbox should call select
		fireEvent.press(getByTestId('list-item'));
		expect(onSelect).toHaveBeenCalledTimes(1);
		fireEvent.press(getByTestId('select-checkbox'));
		expect(onSelect).toHaveBeenCalledTimes(2);
	});
});
/* eslint-enable react/prop-types, react/display-name, no-shadow */
