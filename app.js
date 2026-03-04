let data;

function loadData() {
  try {
    const stored = localStorage.getItem('scratchpad-data');
    if (stored) {
      data = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse data', e);
  }
  if (!data || !data.workspaces) {
    data = {
      currentWorkspace: null,
      currentNote: null,
      workspaces: []
    };
    // create default workspace
    const wsId = 'ws-' + Date.now();
    data.workspaces.push({ id: wsId, name: 'Default', notes: [] });
    data.currentWorkspace = wsId;
    data.currentNote = null;
    saveData();
  }
}

function saveData() {
  localStorage.setItem('scratchpad-data', JSON.stringify(data));
}

function renderWorkspaces() {
  const ul = document.getElementById('workspaceList');
  ul.innerHTML = '';
  data.workspaces.forEach(ws => {
    const li = document.createElement('li');
    li.textContent = ws.name;
    li.dataset.id = ws.id;
    if (ws.id === data.currentWorkspace) li.classList.add('active');
    li.onclick = () => {
      selectWorkspace(ws.id);
    };
    ul.appendChild(li);
  });
}

function renderNotes() {
  const noteList = document.getElementById('noteList');
  noteList.innerHTML = '';
  let currentWs = data.workspaces.find(w => w.id === data.currentWorkspace);
  if (!currentWs) return;
  if (currentWs.notes.length === 0) {
    const li = document.createElement('li');
    li.textContent = '(No notes)';
    li.style.fontStyle = 'italic';
    noteList.appendChild(li);
    return;
  }
  currentWs.notes.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note.name;
    li.dataset.id = note.id;
    if (note.id === data.currentNote) li.classList.add('active');
    li.onclick = () => {
      selectNote(note.id);
    };
    noteList.appendChild(li);
  });
}

function selectWorkspace(id) {
  data.currentWorkspace = id;
  data.currentNote = null;
  saveData();
  renderWorkspaces();
  renderNotes();
  displayNote();
}

function selectNote(noteId) {
  data.currentNote = noteId;
  saveData();
  renderNotes();
  displayNote();
}

function displayNote() {
  const titleEl = document.getElementById('currentNoteName');
  const contentEl = document.getElementById('noteContent');
  if (!data.currentWorkspace) {
    titleEl.textContent = 'No workspace selected';
    contentEl.value = '';
    contentEl.disabled = true;
    return;
  }
  const currentWs = data.workspaces.find(w => w.id === data.currentWorkspace);
  const currentNote = currentWs.notes.find(n => n.id === data.currentNote);
  if (!currentNote) {
    titleEl.textContent = 'Select a note';
    contentEl.value = '';
    contentEl.disabled = true;
  } else {
    titleEl.textContent = currentNote.name;
    contentEl.value = currentNote.content;
    contentEl.disabled = false;
  }
}

function createWorkspace() {
  const name = prompt('Workspace name');
  if (!name) return;
  const id = 'ws-' + Date.now();
  data.workspaces.push({ id, name, notes: [] });
  data.currentWorkspace = id;
  data.currentNote = null;
  saveData();
  renderWorkspaces();
  renderNotes();
  displayNote();
}

function createNote() {
  if (!data.currentWorkspace) {
    alert('Please select a workspace first.');
    return;
  }
  const name = prompt('Note name', 'New Note');
  const id = 'note-' + Date.now();
  const note = { id, name: name || 'Untitled', content: '' };
  const ws = data.workspaces.find(w => w.id === data.currentWorkspace);
  ws.notes.push(note);
  data.currentNote = id;
  saveData();
  renderNotes();
  displayNote();
}

function saveCurrentNote() {
  if (!data.currentWorkspace || !data.currentNote) return;
  const ws = data.workspaces.find(w => w.id === data.currentWorkspace);
  const note = ws.notes.find(n => n.id === data.currentNote);
  note.content = document.getElementById('noteContent').value;
  // update note name if default or empty
  if (!note.name || note.name === 'New Note' || note.name === 'Untitled') {
    const firstLine = note.content.split('\n')[0].trim();
    note.name = firstLine.substring(0, 20) || 'Untitled';
  }
  saveData();
  renderNotes();
  displayNote();
}

function exportData() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scratchpad-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFile() {
  document.getElementById('importInput').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (imported.workspaces) {
        data = imported;
        saveData();
        renderWorkspaces();
        renderNotes();
        displayNote();
      } else {
        alert('Invalid file format.');
      }
    } catch (err) {
      alert('Invalid JSON file.');
    }
  };
  reader.readAsText(file);
}

window.onload = function() {
  loadData();
  renderWorkspaces();
  renderNotes();
  displayNote();
  document.getElementById('newWorkspaceBtn').onclick = createWorkspace;
  document.getElementById('newNoteBtn').onclick = createNote;
  document.getElementById('saveNoteBtn').onclick = saveCurrentNote;
  document.getElementById('exportBtn').onclick = exportData;
  document.getElementById('importBtn').onclick = importFile;
  document.getElementById('importInput').onchange = handleImport;
};
