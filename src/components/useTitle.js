import * as React from 'react';

export function useTitle(title) {
  React.useEffect(() => {
    const prevTitle = document.title
    document.title = title
    return () => {
      document.title = prevTitle
    }
  })
}
