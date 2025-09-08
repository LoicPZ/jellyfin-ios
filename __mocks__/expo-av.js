const React = require('react');
const { View } = require('react-native');

// Constants used by the app
const InterruptionModeAndroid = {
  DoNotMix: 1,
  DuckOthers: 2
};
const InterruptionModeIOS = {
  DoNotMix: 1,
  DuckOthers: 2
};
const VideoFullscreenUpdate = {
  PLAYER_WILL_PRESENT: 0,
  PLAYER_DID_PRESENT: 1,
  PLAYER_WILL_DISMISS: 2,
  PLAYER_DID_DISMISS: 3
};

// Minimal Audio mock with a Sound API used by the app
const mockSound = () => {
  let status = { isLoaded: true, isPlaying: false, positionMillis: 0 };
  return {
    getStatusAsync: jest.fn(async () => status),
    setPositionAsync: jest.fn(async (ms) => { status.positionMillis = ms; return status; }),
    playAsync: jest.fn(async () => { status.isPlaying = true; return status; }),
    pauseAsync: jest.fn(async () => { status.isPlaying = false; return status; }),
    stopAsync: jest.fn(async () => { status.isPlaying = false; status.positionMillis = 0; return status; }),
    unloadAsync: jest.fn(async () => { status.isLoaded = false; return status; })
  };
};

const Audio = {
  setAudioModeAsync: jest.fn(async () => {}),
  Sound: {
    createAsync: jest.fn(async () => ({ sound: mockSound(), status: {} }))
  }
};

// Simple Video component placeholder
const Video = React.forwardRef((props, ref) => {
  // Minimal placeholder; keep children only to limit snapshot size
  return React.createElement(View, { ref, testID: 'mock-video' }, props.children);
});
Video.displayName = 'Video';

module.exports = {
  Audio,
  InterruptionModeAndroid,
  InterruptionModeIOS,
  Video,
  VideoFullscreenUpdate
};
