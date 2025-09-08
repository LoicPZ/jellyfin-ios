/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { act, render } from '@testing-library/react-native';
import React from 'react';

import VideoPlayer from '../VideoPlayer';

describe('VideoPlayer', () => {
    it('renders video component', () => {
        const { getByTestId, unmount } = render(<VideoPlayer />);
        expect(getByTestId('mock-video')).toBeTruthy();
        act(unmount);
    });
});
