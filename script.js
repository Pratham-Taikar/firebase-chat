import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from './firebase-config.js';

const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message-input');
const messagesDiv = document.getElementById('messages');

let currentUser = null;

loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    alert("Login failed");
  }
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    loadMessages();
  } else {
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    messagesDiv.innerHTML = '';
  }
});

sendBtn.onclick = async () => {
  const text = messageInput.value.trim();
  if (text === '' || !currentUser) return;

  await addDoc(collection(db, 'messages'), {
    text,
    uid: currentUser.uid,
    displayName: currentUser.displayName,
    timestamp: new Date()
  });

  messageInput.value = '';
};

function loadMessages() {
  const q = query(collection(db, 'messages'), orderBy('timestamp'));
  onSnapshot(q, snapshot => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = 'message' + (msg.uid === currentUser.uid ? ' own' : '');
      div.textContent = `${msg.displayName}: ${msg.text}`;
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}
