'use client'

import React from 'react';

/**
 * GridBackground component that creates a grid pattern with animated paths
 */
export default function GridBackground() {
  return (
    <div className="grid-animation-container">
      <div className="grid-path grid-path-1"></div>
      <div className="grid-path grid-path-2"></div>
      <div className="grid-path grid-path-3"></div>
      <div className="grid-path grid-path-4"></div>
      <div className="grid-path grid-path-1" style={{ animationDelay: '7s', top: '65%', left: '15%' }}></div>
    </div>
  );
}
