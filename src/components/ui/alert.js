import React from 'react';

export function Alert({ className = '', children, ...props }) {
  return <div className={className} {...props}>{children}</div>;
}

export function AlertDescription(props) {
  return <p {...props} />;
}
