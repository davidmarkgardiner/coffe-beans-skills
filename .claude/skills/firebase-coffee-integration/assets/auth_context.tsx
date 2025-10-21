// src/contexts/AuthContext.tsx
// Firebase Authentication Context Provider

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

interface AuthContextType {
  currentUser: User | null
  userRole: 'customer' | 'admin' | null
  loading: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<'customer' | 'admin' | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user role from Firestore
  async function fetchUserRole(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        return userDoc.data().role || 'customer'
      }
      return 'customer'
    } catch (error) {
      console.error('Error fetching user role:', error)
      return 'customer'
    }
  }

  // Create user document in Firestore
  async function createUserDocument(user: User, additionalData: any = {}) {
    const userRef = doc(db, 'users', user.uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user
      try {
        await setDoc(userRef, {
          uid: user.uid,
          email,
          displayName: displayName || '',
          photoURL: photoURL || '',
          role: 'customer',
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now(),
          shippingAddresses: [],
          preferences: {
            newsletter: false,
            emailNotifications: true,
          },
          ...additionalData,
        })
      } catch (error) {
        console.error('Error creating user document:', error)
      }
    } else {
      // Update last login
      await setDoc(
        userRef,
        { lastLogin: Timestamp.now() },
        { merge: true }
      )
    }
  }

  async function signup(email: string, password: string, displayName?: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    if (displayName) {
      await updateProfile(user, { displayName })
    }

    await createUserDocument(user, { displayName })
  }

  async function login(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    await createUserDocument(user)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const { user } = await signInWithPopup(auth, provider)
    await createUserDocument(user)
  }

  async function logout() {
    await signOut(auth)
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
  }

  async function updateUserProfile(displayName: string, photoURL?: string) {
    if (!currentUser) return

    await updateProfile(currentUser, {
      displayName,
      ...(photoURL && { photoURL }),
    })

    // Update Firestore
    const userRef = doc(db, 'users', currentUser.uid)
    await setDoc(
      userRef,
      {
        displayName,
        ...(photoURL && { photoURL }),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    )
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (user) {
        const role = await fetchUserRole(user.uid)
        setUserRole(role)
      } else {
        setUserRole(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Protected route component
export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { currentUser, userRole, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!currentUser) {
    // Redirect to login
    window.location.href = '/login'
    return null
  }

  if (adminOnly && userRole !== 'admin') {
    // Redirect to home or show unauthorized
    window.location.href = '/'
    return null
  }

  return <>{children}</>
}
