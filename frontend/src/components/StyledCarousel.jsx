import React from 'react';
import Carousel from 'react-material-ui-carousel';

export default function StyledCarousel({ children, sx }) {
  return (
    <Carousel navButtonsAlwaysVisible autoPlay={false} swipe={false} indicators animation="slide" sx={sx}>
      { children }
    </Carousel>
  );
}
