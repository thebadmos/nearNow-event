/**
 * Redux Store
 * 
 * Simplified Redux store for NearNow application.
 * Currently minimal as we don't need auth or dashboard state.
 * Can be extended in the future if needed.
 */

import { configureStore } from "@reduxjs/toolkit";

// Create a minimal store (no reducers needed for now)
// If you need to add state management in the future, add reducers here
const store = configureStore({
  reducer: {
    // Add reducers here in the future if needed
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store };
