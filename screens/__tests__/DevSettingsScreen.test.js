/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, render } from '@testing-library/react-native';
import React from 'react';

import DevSettingsScreen from '../DevSettingsScreen';

describe('DevSettingsScreen', () => {
    it('shows experimental toggles', () => {
        const { getByText, unmount } = render(<DevSettingsScreen />);
        expect(getByText('Native Audio Player')).toBeTruthy();
        expect(getByText('Transcoded Downloads')).toBeTruthy();
        act(unmount);
    });
});
