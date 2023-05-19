import SvgIcon from '@mui/material/SvgIcon';
import React from 'react';
import { ReactComponent as NYTIconImage } from '../images/nyt-icon.svg';

// using NYT logo under the NYT API branding guidelines (https://developer.nytimes.com/branding)
// img sourced from wikimedia https://commons.wikimedia.org/wiki/File:New_York_Times_T_icon.svg
export default function NYTIcon({ sx }) {
  return (
    <SvgIcon sx={sx}>
      <NYTIconImage />
    </SvgIcon>
  );
}
