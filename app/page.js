"use client";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDAUaxbBV2-sdDgexAhdy0h1XgBcMuWnN4",
  authDomain: "todo-219ce.firebaseapp.com",
  projectId: "todo-219ce",
  storageBucket: "todo-219ce.firebasestorage.app",
  messagingSenderId: "494738606732",
  appId: "1:494738606732:web:fbffd3fa66e3a856bdc9a9",
  measurementId: "G-N41MMTS0KK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [editIndex, setEditIndex] = useState(null);

  // Fetch tasks from Firestore
  const fetchTasks = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setTasks(docSnap.data().tasks || []);
    } else {
      await setDoc(docRef, { tasks: [] }); // Initialize document if not exists
    }
  };

  // Save tasks to Firestore
  const saveTasks = async (uid, updatedTasks) => {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { tasks: updatedTasks });
  };

  // Handle user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchTasks(currentUser.uid);
      } else {
        setUser(null);
        setTasks([]);
      }
    });
    return unsubscribe;
  }, []);

  // Add or Update Task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title || !desc) return;

    let updatedTasks = [...tasks];
    if (editIndex !== null) {
      updatedTasks[editIndex] = { title, desc };
      setEditIndex(null);
    } else {
      updatedTasks.push({ title, desc });
    }

    setTasks(updatedTasks);
    setTitle("");
    setDesc("");
    if (user) {
      await saveTasks(user.uid, updatedTasks);
    }
  };

  // Delete Task
  const handleTaskDelete = async (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
    if (user) {
      await saveTasks(user.uid, updatedTasks);
    }
  };

  // Edit Task
  const handleTaskEdit = (index) => {
    setTitle(tasks[index].title);
    setDesc(tasks[index].desc);
    setEditIndex(index);
  };

  // Sign In
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setTasks([]);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {user ? (
        <div className="w-full max-w-2xl">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Task Manager</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition duration-300"
            >
              Sign Out
            </button>
          </header>
          <form onSubmit={handleTaskSubmit} className="flex flex-col gap-4 mb-6">
            <input
              type="text"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-gray-700 focus:border-purple-500 outline-none transition duration-300"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-gray-700 focus:border-purple-500 outline-none transition duration-300"
              placeholder="Task Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-bold transition duration-300"
            >
              {editIndex !== null ? "Update Task" : "Add Task"}
            </button>
          </form>
          <ul className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-gray-400">No tasks available. Add some!</p>
            ) : (
              tasks.map((task, index) => (
                <li
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <p className="text-gray-400">{task.desc}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTaskEdit(index)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition duration-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleTaskDelete(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition duration-300"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to Task Manager</h1>
          <p className="text-gray-400 mb-6">
            Sign in with Google to start managing your tasks.
          </p>
          <button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition duration-300"
          >
            Sign In with Google
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
