// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    addDoc,
    updateDoc,
    orderBy,
    limit,
    startAfter,
    getDocs,
    setLogLevel
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getStorage,
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAB0UsTKcsRu2JBm2bAYIDHTz_qLS1WATA",
    authDomain: "neonbirfranchisee.firebaseapp.com",
    projectId: "neonbirfranchisee",
    storageBucket: "neonbirfranchisee.appspot.com",
    messagingSenderId: "51668421951",
    appId: "1:51668421951:web:7d94456ebe84bba439578a",
    measurementId: "G-501H1CJ59J"
};

// Initialize Firebase
setLogLevel('error'); // Changed from 'Debug' to reduce console noise

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// App ID for Firestore paths - MUST match Firebase structure
// Firebase uses appId (not projectId) for artifact paths
const localAppId = firebaseConfig.appId || 'default-neonbirr-app';

// Firebase Service Class
class FirebaseService {
    constructor() {
        this.app = app;
        this.db = db;
        this.auth = auth;
        this.storage = storage;
        this.localAppId = localAppId;
    }

    // Authentication Methods
    async loginWithEmail(email, password) {
        return await signInWithEmailAndPassword(this.auth, email, password);
    }

    async logout() {
        return await signOut(this.auth);
    }

    async createUser(email, password) {
        return await createUserWithEmailAndPassword(this.auth, email, password);
    }

    onAuthChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    async signInAnon() {
        return await signInAnonymously(this.auth);
    }

    async signInCustom(token) {
        return await signInWithCustomToken(this.auth, token);
    }

    // Firestore Methods
    async getDocument(path) {
        const docRef = doc(this.db, path);
        return await getDoc(docRef);
    }

    async setDocument(path, data, options = {}) {
        const docRef = doc(this.db, path);
        return await setDoc(docRef, data, options);
    }

    async updateDocument(path, data) {
        const docRef = doc(this.db, path);
        return await updateDoc(docRef, data);
    }

    async addDocument(collectionPath, data) {
        const colRef = collection(this.db, collectionPath);
        return await addDoc(colRef, data);
    }

    // Query Methods with Pagination Support
    async queryDocuments(collectionPath, constraints = [], limitNum = null, lastDoc = null) {
        const colRef = collection(this.db, collectionPath);
        let queryConstraints = [...constraints];

        if (limitNum) {
            queryConstraints.push(limit(limitNum));
        }

        if (lastDoc) {
            queryConstraints.push(startAfter(lastDoc));
        }

        const q = query(colRef, ...queryConstraints);
        const snapshot = await getDocs(q);

        return {
            docs: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            lastDoc: snapshot.docs[snapshot.docs.length - 1],
            hasMore: snapshot.docs.length === limitNum
        };
    }

    // Real-time Listener
    onSnapshotQuery(collectionPath, constraints, callback, errorCallback) {
        const colRef = collection(this.db, collectionPath);
        const q = query(colRef, ...constraints);
        return onSnapshot(q, callback, errorCallback);
    }

    // Storage Methods with better error handling
    async uploadFile(file, path) {
        try {
            const fileRef = storageRef(this.storage, path);

            // Upload with metadata to help with CORS
            const metadata = {
                contentType: file.type,
                customMetadata: {
                    'uploadedBy': this.auth.currentUser?.uid || 'anonymous',
                    'uploadedAt': new Date().toISOString()
                }
            };

            const snapshot = await uploadBytes(fileRef, file, metadata);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            console.error('Upload error:', error);
            // Return placeholder if upload fails
            return `https://placehold.co/400x400/FF5A36/ffffff?text=UploadError`;
        }
    }


    // Helper: Get Orders Collection Path
    getOrdersPath() {
        return `artifacts/${this.localAppId}/public/data/orders`;
    }

    // Helper: Get User Role Path
    getUserRolePath(uid) {
        return `artifacts/${this.localAppId}/users/${uid}/roles/info`;
    }

    // Helper: Get Delivery Settings Path
    getDeliverySettingsPath() {
        return `artifacts/${this.localAppId}/public/settings/system/delivery`;
    }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;

// Also export individual modules for specific use
export {
    app,
    db,
    auth,
    storage,
    localAppId,
    where,
    orderBy,
    limit,
    startAfter
};
