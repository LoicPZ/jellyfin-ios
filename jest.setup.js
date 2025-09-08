/**
 * Copyright (c) 2025 Jellyfin Contributors
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// import '@testing-library/jest-dom'

/* AsyncStorage Mock */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

/* Fetch and AbortController Mocks */
import { enableFetchMocks } from 'jest-fetch-mock';
import { AbortController } from 'node-abort-controller';

// DOMException is not polyfilled in released version of jest-fetch-mock
// refs: https://github.com/jefflau/jest-fetch-mock/pull/160
if (typeof DOMException === 'undefined') {
	global.DOMException = require('domexception');
}

global.AbortController = AbortController;

enableFetchMocks();

/* React Navigation Mocks */
import 'react-native-gesture-handler/jestSetup';

// Polyfills for JSDOM environment changes in newer Jest versions
if (typeof global.setImmediate === 'undefined') {
	global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

jest.mock('react-native-reanimated', () => {
	const Reanimated = require('react-native-reanimated/mock');

	// The mock for `call` immediately calls the callback which is incorrect
	// So we override it with a no-op
	Reanimated.default.call = () => { /* no-op */ };

	return Reanimated;
});

// Mock native modules that are unavailable in Jest
jest.mock('expo-av');
jest.mock('react-native-webview');

// RN >= 0.79 no longer needs NativeAnimatedHelper mock

// Workaround for process failing: https://github.com/react-navigation/react-navigation/issues/9568
jest.mock('@react-navigation/native/lib/commonjs/useLinking.native', () => ({
	default: () => ({ getInitialState: { then: jest.fn() } }),
	__esModule: true
}));

/* Safe Area Context Mocks */
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

/* UUID Mocks */
jest.mock('uuid', () => {
	let value = 0;
	return {
		v4: () => `uuid-${value++}`
	};
});

/* React Native Menu Mocks */
jest.mock('@react-native-menu/menu', () => ({
	MenuView: jest.fn((props) => {
		const React = require('react');

		class MockMenuView extends React.Component {
			render() {
				return React.createElement(
					'View',
					{ testID: props.testID },
					// Dynamically mock each action
					props.actions.map(action =>
						React.createElement('Button', {
							key: action.id,
							title: action.title,
							onPress: () => {
								if (action.id && props?.onPressAction) {
									props.onPressAction({ nativeEvent: { event: action.id } });
								}
							},
							testID: action.id
						})
					),
					// eslint-disable-next-line react/prop-types
					this.props.children
				);
			}
		}

		return React.createElement(MockMenuView, props);
	})
}));
