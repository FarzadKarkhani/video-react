import React from 'react';
import { Player } from 'video-react';

export default (props) => {
  // Add customized HLSSource component into video-react Player
  // The Component with `isVideoChild` attribute will be added into `Video` component
  // Please use this url if you test it from local:
  // http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8
  return (
    <Player onStatsChange={(a) => {console.log(a)}} autoPlay>
      <source src="http://www.streambox.fr/playlists/x36xhzz/x36xhzz.m3u8"/>
    </Player>
  );
};
