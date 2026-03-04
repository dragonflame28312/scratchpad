const OWNER = 'dragonflame28312';
const REPO = 'scratchpad';
const NOTES_PATH = 'notes';
const FILES_PATH = 'files';

function getToken() {
  return localStorage.getItem('gh_token') || '';
}

function saveToken() {
  const t = document.getElementById('token').value.trim();
  if (t) {
    localStorage.setItem('gh_token', t);
    const status = document.getElementById('tokenStatus');
    if (status) status.innerText = 'Token saved locally';
  }
}

// Initialize after DOM loads
window.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (token) {
    const tokenInput = document.getElementById('token');
    if (tokenInput) tokenInput.value = token;
    const status = document.getElementById('tokenStatus');
    if (status) status.innerText = 'Token loaded';
  }
  loadNotes();
  loadFiles();

  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#999';
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#555';
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#555';
      const files = e.dataTransfer.files;
      uploadFileList(files);
    });
  }
});

async function loadNotes() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${NOTES_PATH}`);
    const ul = document.getElementById('noteList');
    if (!res.ok) {
      if (ul) ul.innerHTML = '<li>No notes yet</li>';
      return;
    }
    const data = await res.json();
    data.sort((a, b) => b.name.localeCompare(a.name));
    if (ul) ul.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = item.name;
      a.onclick = () => { viewNote(item.path, item.download_url); };
      li.appendChild(a);
      if (ul) ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function viewNote(path, url) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    const view = document.getElementById('noteView');
    if (view) view.innerText = text;
  } catch (err) {
    console.error(err);
  }
}

async function saveNote() {
  const text = document.getElementById('noteText').value;
  if (!text) {
    alert('Enter some text');
    return;
  }
  const token = getToken();
  if (!token) {
    alert('Token required to save note');
    return;
  }
  const filename = `note-${Date.now()}.txt`;
  const content = btoa(unescape(encodeURIComponent(text)));
  const path = `${NOTES_PATH}/${filename}`;
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'token ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Add note',
      content: content
    })
  });
  document.getElementById('noteText').value = '';
  loadNotes();
}

async function loadFiles() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILES_PATH}`);
    const ul = document.getElementById('fileList');
    if (!res.ok) {
      if (ul) ul.innerHTML = '<li>No files yet</li>';
      return;
    }
    const data = await res.json();
    data.sort((a, b) => b.name.localeCompare(a.name));
    if (ul) ul.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.download_url;
      a.textContent = item.name;
      a.target = '_blank';
      li.appendChild(a);
      if (ul) ul.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

function uploadFiles() {
  const files = document.getElementById('fileInput').files;
  uploadFileList(files);
}

function uploadFileList(fileList) {
  for (let i = 0; i < fileList.length; i++) {
    uploadSingleFile(fileList[i]);
  }
}

async function uploadSingleFile(file) {
  const token = getToken();
  if (!token) {
    alert('Token required to upload file');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    const filename = `${Date.now()}-${file.name}`;
    const path = `${FILES_PATH}/${filename}`;
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Upload file',
        content: base64
      })
    });
    loadFiles();
  };
  reader.readAsDataURL(file);
}
