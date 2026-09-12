import { ThemeProvider } from './context/themeContext';
import { WallpaperProvider } from './context/wallpaperContext';
import { Navigate, Route, Routes } from 'react-router';
import { useAuth } from '@clerk/react';
import ChatPage from './Pages/ChatPage';
import AuthPage from './Pages/AuthPage';
import PageLoader from './components/PageLoader';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';


function App() {

	const { isSignedIn, isLoaded } = useAuth()

	// const {checkAuthentication, clearAuthentication, isCheckingAuth} = useAuthStore()

	const clearAuth = useAuthStore((state) => state.clearAuthentication)

	const checkAuth = useAuthStore((state) => state.checkAuthentication)

	const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth)

	useEffect(() => {
		if(!isLoaded) return

		if(isSignedIn) checkAuth()
		else clearAuth()

	}, [checkAuth, clearAuth, isLoaded, isSignedIn])

	if(!isLoaded || (isSignedIn && isCheckingAuth)){
		return <PageLoader />
	}

	return (
		<ThemeProvider>
			<WallpaperProvider>
				<Routes>
					<Route path='/' element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
					<Route path='/auth' element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />} />
				</Routes>
				<Toaster />
			</WallpaperProvider>
		</ThemeProvider>
	)
}

export default App
