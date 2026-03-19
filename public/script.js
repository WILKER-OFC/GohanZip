const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const statusDiv = document.getElementById('status');
const fileListDiv = document.getElementById('fileList');

// Cargar la lista de archivos al iniciar
document.addEventListener('DOMContentLoaded', fetchFileList);

// Manejar la subida de archivos
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!fileInput.files[0]) {
        showStatus('Por favor selecciona un archivo', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    uploadBtn.disabled = true;
    showStatus('Subiendo...', 'info');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showStatus('¡Archivo subido con éxito!', 'success');
            fileInput.value = '';
            fetchFileList();
        } else {
            showStatus('Error al subir el archivo', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error de conexión', 'error');
    } finally {
        uploadBtn.disabled = false;
    }
});

// Obtener la lista de archivos del servidor
async function fetchFileList() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        
        if (files.length === 0) {
            fileListDiv.innerHTML = '<p>No hay archivos disponibles aún.</p>';
            return;
        }

        // Limpiar el contenedor antes de renderizar
        fileListDiv.innerHTML = '';

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const icon = document.createElement('div');
            icon.className = 'file-icon';
            icon.textContent = '📄';

            const name = document.createElement('div');
            name.className = 'file-name';
            name.textContent = file.name; // SEGURO: Evita XSS

            const downloadLink = document.createElement('a');
            downloadLink.href = file.url;
            downloadLink.className = 'download-link';
            downloadLink.textContent = 'Descargar';
            downloadLink.setAttribute('download', file.name);

            fileItem.appendChild(icon);
            fileItem.appendChild(name);
            fileItem.appendChild(downloadLink);
            fileListDiv.appendChild(fileItem);
        });
    } catch (error) {
        console.error('Error al cargar archivos:', error);
        fileListDiv.innerHTML = '<p>Error al cargar la lista de archivos.</p>';
    }
}

function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
    
    if (type === 'success') {
        statusDiv.style.color = '#28a745';
    } else if (type === 'error') {
        statusDiv.style.color = '#dc3545';
    } else {
        statusDiv.style.color = '#0070f3';
    }
}
