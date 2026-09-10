import { ThemeProvider } from './context/themeContext';
import { WallpaperProvider } from './context/wallpaperContext';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '@clerk/react';
import ChatPage from './Pages/ChatPage';
import AuthPage from './Pages/AuthPage';


function App() {

	const { isSignedIn, isLoaded } = useAuth()

	if(!isLoaded){
		<p>Loading...</p>
	}

	return (
		<ThemeProvider>
			<WallpaperProvider>
				<h1 className='text-3xl text-center'>This is a Chat App</h1>
				<Routes>
					<Route path='/' element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
					<Route path='/auth' element={!isSignedIn ? <AuthPage /> : <Navigate to={"/chat"} replace />} />
				</Routes>
			</WallpaperProvider>
		</ThemeProvider>
	)
}

export default App
