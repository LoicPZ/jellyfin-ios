/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NavigationContainer } from '@react-navigation/native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

import { parseUrl, validateServer } from '../../utils/ServerValidator';
import ServerInput from '../ServerInput';

import '../../i18n';

// Minimal navigation mock to support replace()
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useNavigation: () => ({ replace: jest.fn() })
    };
});

// Mock RNE Input to avoid Animated internals causing issues under Jest 29/RN 0.79
jest.mock('react-native-elements', () => {
    const actual = jest.requireActual('react-native-elements');
    const React = require('react');
    const { TextInput } = require('react-native');
    return {
        ...actual,
        Input: React.forwardRef((props, ref) => (
            React.createElement(React.Fragment, null,
                React.createElement(TextInput, {
                    ref,
                    testID: props.testID || 'server-input',
                    placeholder: props.placeholder,
                    value: props.value,
                    editable: props.editable,
                    onChangeText: props.onChangeText,
                    onSubmitEditing: props.onSubmitEditing
                }),
                props.errorMessage ? React.createElement(require('react-native').Text, null, props.errorMessage) : null
            )
        ))
    };
});

jest.mock('../../utils/ServerValidator');
parseUrl.mockImplementation(url => url);
validateServer.mockResolvedValue({ isValid: true });

describe('ServerInput', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	it('should render correctly', async () => {
    const { unmount } = render(
			<NavigationContainer>
				<ServerInput />
			</NavigationContainer>
		);

    act(unmount);
	});

	it('should show error when input is blank', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, queryByText, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);
		const input = getByTestId('server-input');

		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(parseUrl).not.toHaveBeenCalled();
		expect(validateServer).not.toHaveBeenCalled();

    // Expect an error message to be visible
    expect(queryByText(/cannot be empty/i)).toBeTruthy();
    act(unmount);
	});

	it('should show error when url is undefined', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, queryByText, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);
		const input = getByTestId('server-input');

		fireEvent(input, 'onChangeText', undefined);
		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(parseUrl).not.toHaveBeenCalled();
		expect(validateServer).not.toHaveBeenCalled();

    expect(queryByText(/cannot be empty/i)).toBeTruthy();
    act(unmount);
	});

	it('should show error when url is whitespace', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, queryByText, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);
		const input = getByTestId('server-input');

		fireEvent(input, 'onChangeText', '   	');
		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(parseUrl).not.toHaveBeenCalled();
		expect(validateServer).not.toHaveBeenCalled();

    expect(queryByText(/cannot be empty/i)).toBeTruthy();
    act(unmount);
	});

	it('should succeed for valid urls', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);
		const input = getByTestId('server-input');
		fireEvent(input, 'onChangeText', 'test');
		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onSuccess).toHaveBeenCalled());
		expect(onError).not.toHaveBeenCalled();
		expect(parseUrl).toHaveBeenCalled();
		expect(validateServer).toHaveBeenCalled();

    act(unmount);
	});

	it('should show error if parseUrl throws', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, queryByText, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);

		parseUrl.mockImplementationOnce(() => {
			throw new Error('test error');
		});

		const input = getByTestId('server-input');
		fireEvent(input, 'onChangeText', 'test');
		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(parseUrl).toHaveBeenCalled();
		expect(validateServer).not.toHaveBeenCalled();

    // Expect an error message to be visible
    expect(queryByText(/is invalid/i)).toBeTruthy();
    act(unmount);
	});

	it('should show error if url is invalid', async () => {
		const onError = jest.fn();
		const onSuccess = jest.fn();
    const { getByTestId, queryByText, unmount } = render(
			<NavigationContainer>
				<ServerInput
					onError={onError}
					onSuccess={onSuccess}
				/>
			</NavigationContainer>
		);

		validateServer.mockResolvedValueOnce({ isValid: false });

		const input = getByTestId('server-input');
		fireEvent(input, 'onChangeText', 'test');
		fireEvent(input, 'onSubmitEditing');

		await waitFor(() => expect(onError).toHaveBeenCalled());
		expect(onSuccess).not.toHaveBeenCalled();
		expect(parseUrl).toHaveBeenCalled();
		expect(validateServer).toHaveBeenCalled();

    expect(queryByText(/invalid/i)).toBeTruthy();
    act(unmount);
	});
});
