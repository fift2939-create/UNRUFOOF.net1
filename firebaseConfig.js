const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAO7RwjeVY_t2qpPSXlqXgkVToc8A9Qcwk",
    authDomain: "rufoof-d1fb7.firebaseapp.com",
    projectId: "rufoof-d1fb7",
    storageBucket: "rufoof-d1fb7.firebasestorage.app",
    messagingSenderId: "485701440428",
    appId: "1:485701440428:web:0d9bfa189897520333e009",
    measurementId: "G-2V4FZZBYS5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

module.exports = { db };
