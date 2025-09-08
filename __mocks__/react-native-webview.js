/* eslint-disable react/prop-types */
const React = require('react');
const { View } = require('react-native');

// Minimal WebView mock that renders a plain View
function WebView(props, ref) {
	// Do not spread all props to avoid massive snapshots; keep children only
	return React.createElement(View, { ref, testID: 'mock-webview' }, props.children);
}

module.exports = {
	WebView: React.forwardRef(WebView)
};
/* eslint-enable react/prop-types */
