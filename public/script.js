const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const statusText = document.getElementById('status-text');
const resultArea = document.getElementById('result-area');
const shareLinkInput = document.getElementById('share-link');
const copyBtn = document.getElementById('copy-btn');
const uploadMoreBtn = document.getElementById('upload-more');

// Handle Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('dragging'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragging'), false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle File Input Selection
fileInput.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    // UI Update
    dropArea.style.display = 'none';
    progressContainer.style.display = 'block';
    resultArea.style.display = 'none';
    statusText.innerText = 'Subiendo ' + file.name + '...';

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressBar.style.width = percentComplete + '%';
        }
    });

    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                showResult(response.downloadLink);
            } else {
                alert('Error al subir el archivo');
                resetUI();
            }
        }
    };

    xhr.open('POST', '/upload', true);
    xhr.send(formData);
}

function showResult(link) {
    progressContainer.style.display = 'none';
    resultArea.style.display = 'block';
    shareLinkInput.value = link;
}

function resetUI() {
    dropArea.style.display = 'block';
    progressContainer.style.display = 'none';
    resultArea.style.display = 'none';
    progressBar.style.width = '0%';
    fileInput.value = '';
}

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shareLinkInput.value);
        copyBtn.innerText = '¡Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    } catch (err) {
        console.error('Error al copiar: ', err);
        // Fallback for older browsers
        shareLinkInput.select();
        document.execCommand('copy');
    }
});

uploadMoreBtn.addEventListener('click', resetUI);
