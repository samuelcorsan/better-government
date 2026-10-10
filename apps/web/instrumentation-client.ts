import { initBotId } from 'botid/client/core';

// Attaches the BotID challenge headers that checkBotId() verifies in the search route.
initBotId({ protect: [{ path: '/api/search', method: 'POST' }] });
