// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzV-KP-UsJppqTr-6m3kuX2dzJpVK88EU",
  authDomain: "cng-firebase.firebaseapp.com",
  projectId: "cng-firebase",
  storageBucket: "cng-firebase.appspot.com",
  messagingSenderId: "216577560788",
  appId: "1:216577560788:web:6f268984fbdee42b532b41",
  databaseURL: "https://cng-firebase-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth, app };