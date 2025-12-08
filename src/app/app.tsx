/**
 * App Component
 * 
 * Root component that provides context and global UI elements.
 * Simplified for NearNow - no Redux needed for current features.
 */

"use client";

import React from "react";
import { ToastContainer } from "react-toastify";
import AppProvider from "./context/context";

const App = ({ children }: { children: React.ReactNode }) => {
	return (
		<AppProvider>
			{children}
			<ToastContainer />
		</AppProvider>
	);
};

export default App;
