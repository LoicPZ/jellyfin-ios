/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemeProvider } from 'react-native-elements';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/* eslint-disable react/display-name, no-shadow */
import '../../i18n';
import { useStores } from '../../hooks/useStores';
import HomeScreen from '../HomeScreen';

jest.mock('@react-navigation/native', () => {
	const actualNav = jest.requireActual('@react-navigation/native');
	return {
		...actualNav,
		useFocusEffect: jest.fn()
	};
});

jest.mock('../../components/NativeShellWebView', () => {
	const React = require('react');
	const { View } = require('react-native');
	return () => React.createElement(View, { testID: 'native-shell-webview' });
});

jest.mock('../../hooks/useStores');
useStores.mockImplementation(() => ({
	rootStore: {
	},
	settingStore: {
		activeServer: 0
	},
	mediaStore: {},
	serverStore: {
		servers: [
			{
				urlString: 'https://example.com'
			}
		]
	}
}));

describe('HomeScreen', () => {
	it('should render correctly', () => {
		const { getByTestId } = render(
			<SafeAreaProvider>
				<ThemeProvider>
					<NavigationContainer>
						<HomeScreen />
					</NavigationContainer>
				</ThemeProvider>
			</SafeAreaProvider>
		);

		expect(getByTestId('native-shell-webview')).toBeTruthy();
	});

	it('should render null when no servers are present', () => {
		useStores.mockImplementationOnce(() => ({
			rootStore: {
			},
			settingStore: {},
			mediaStore: {},
			serverStore: {}
		}));

		const { toJSON } = render(
			<SafeAreaProvider>
				<ThemeProvider>
					<NavigationContainer>
						<HomeScreen />
					</NavigationContainer>
				</ThemeProvider>
			</SafeAreaProvider>
		);

		expect(toJSON()).toBeNull();
	});

	it('should render ErrorView when invalid server exists', () => {
		useStores.mockImplementationOnce(() => ({
			rootStore: {},
			settingStore: {
				activeServer: 0
			},
			mediaStore: {},
			serverStore: {
				servers: [{}]
			}
		}));

		const { getByTestId } = render(
			<SafeAreaProvider>
				<ThemeProvider>
					<NavigationContainer>
						<HomeScreen />
					</NavigationContainer>
				</ThemeProvider>
			</SafeAreaProvider>
		);

		expect(getByTestId('error-view-icon')).toBeTruthy();
	});
});
/* eslint-enable react/display-name, no-shadow */
