import { useEffect } from 'react';

import { config } from '@/lib/lguConfig';

export default function Discord() {
  useEffect(function () {
    window.location.assign(config.portal.discordUrl);
  }, []);
  return <h1>Redirecting to {config.portal.name} Discord Invite Link...</h1>;
}
