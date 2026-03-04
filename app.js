const PASSWORD = "changeme";
const OWNER = "dragonflame28312";
const REPO = "scratchpad";
let TOKEN = "";

function unlock() {
  const p = document.getElementById('pass').value;
  if (p === PASSWORD) {
    TOKEN = document.getElementById('token').value;
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  } else {
    alert('Incorrect password');
  }
}

async function saveText() {
  const text = document.getElementById('text').value;
  // Encode text to base64
  const content = btoa(unescape(encodeURIComponent(text)));
  const path = `snippets/snippet-${Date.now()}.txt`;
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      "Authorization": "token " + TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "add snippet",
      content: content
    })
  });
  alert("Saved");
}

async function uploadFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function() {
    const base64 = reader.result.split(',')[1];
    const path = `uploads/${file.name}`;
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": "token " + TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "upload file",
        content: base64
      })
    });
    alert("Uploaded");
  };
  reader.readAsDataURL(file);
}

async function loadFiles() {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/uploads`, {
    headers: {
      "Authorization": "token " + TOKEN
    }
  });
  const data = await res.json();
  const ul = document.getElementById('files');
  ul.innerHTML = '';
  data.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.download_url;
    a.innerText = item.name;
    li.appendChild(a);
    ul.appendChild(li);
  });
}
