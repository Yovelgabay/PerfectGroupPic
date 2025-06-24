import React from 'react';

export function Button({ className = '', ...props }) {
  return <button className={className} {...props} />;
}
