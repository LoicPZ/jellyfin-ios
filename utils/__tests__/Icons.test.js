/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Platform } from 'react-native';

import { getIconName } from '../Icons';

describe('Icons', () => {
	describe('getIconName()', () => {
		it('should return the name as-is for current Ionicons versions', () => {
			expect(getIconName('test')).toBe('test');
			Platform.OS = 'android';
			expect(getIconName('test')).toBe('test');
		});

		it('should return empty string if called without icon name', () => {
			expect(getIconName()).toBe('');
		});
	});
});
