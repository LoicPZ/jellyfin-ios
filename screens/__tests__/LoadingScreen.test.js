/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { ActivityIndicator } from 'react-native';

import LoadingScreen from '../LoadingScreen';

describe('LoadingScreen', () => {
	it('should render activity indicator', () => {
		const { toJSON, UNSAFE_getByType } = render(<LoadingScreen />);
		expect(toJSON()).toBeTruthy();
		expect(() => UNSAFE_getByType(ActivityIndicator)).not.toThrow();
	});
});
