import React from 'react';

export function Badge({ className = '', ...props }) {
  return <span className={className} {...props} />;
}
