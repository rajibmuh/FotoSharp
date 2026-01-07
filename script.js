// script.js - MAIN FILE - Clean & Simple
// FotoSharp - Aplikasi Pengolahan Citra Digital

// Elements
const imageInput = document.getElementById('image-input');
const dropArea = document.getElementById('drop-area');
const beforeCanvas = document.getElementById('before-canvas');
const afterCanvas = document.getElementById('after-canvas');
const beforePlaceholder = document.getElementById('before-placeholder');
const afterPlaceholder = document.getElementById('after-placeholder');
const intensitySlider = document.getElementById('intensity-slider');
const intensityValue = document.getElementById('intensity-value');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');
const originalInfo = document.getElementById('original-info');
const filterInfo = document.getElementById('filter-info');

// Variables
let originalImage = null;
let processedImage = null;
let currentFilter = null;
let intensity = 3;
let hasFilterApplied = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('FotoSharp - Aplikasi Pengolahan Citra');
    console.log('Modul: 3, 6, dan 7');
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
    
    // Set initial intensity
    intensityValue.textContent = intensitySlider.value;
    intensity = parseInt(intensitySlider.value);
    
    // Setup event listeners
    setupEvents();
});

// Setup all event listeners
function setupEvents() {
    // File upload
    imageInput.addEventListener('change', handleImageSelect);
    
    // Drag and drop
    setupDragDrop();
    
    // Intensity slider
    intensitySlider.addEventListener('input', handleIntensityChange);
    
    // Reset button
    resetBtn.addEventListener('click', resetApplication);
    
    // Download button
    downloadBtn.addEventListener('click', downloadResult);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!originalImage) {
                showMessage('Silakan upload gambar terlebih dahulu', 'warning');
                return;
            }
            
            currentFilter = btn.dataset.mode;
            hasFilterApplied = true;
            
            // Update filter info
            const filterName = btn.querySelector('span').textContent;
            filterInfo.textContent = filterName;
            filterInfo.style.color = 'var(--primary-color)';
            
            console.log(`Menerapkan filter: ${currentFilter}`);
            applyFilter(currentFilter);
            
            // Enable download button
            downloadBtn.disabled = false;
        });
    });
}

// Handle drag and drop
function setupDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, e => e.preventDefault());
    });
    
    dropArea.addEventListener('dragenter', () => {
        dropArea.style.borderColor = 'var(--primary-color)';
        dropArea.style.backgroundColor = 'var(--bg-secondary)';
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = 'var(--border-color)';
        dropArea.style.backgroundColor = 'var(--bg-tertiary)';
    });
    
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--border-color)';
        dropArea.style.backgroundColor = 'var(--bg-tertiary)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
    });
}

// Handle file selection
function handleImageSelect(e) {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
}

// Process uploaded file
function handleFile(file) {
    // Validate file
    if (!file.type.match('image.*')) {
        showMessage('Hanya file gambar (JPG, PNG, GIF) yang diperbolehkan', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Ukuran file maksimal 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            // Store original image
            originalImage = img;
            
            // Display in before canvas
            displayImage(beforeCanvas, beforePlaceholder, img);
            
            // Update file info
            originalInfo.textContent = `${img.width}×${img.height} • ${formatFileSize(file.size)}`;
            
            // Clear after canvas
            const ctx = afterCanvas.getContext('2d');
            ctx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
            afterPlaceholder.style.display = 'flex';
            
            // Reset filter state
            processedImage = null;
            currentFilter = null;
            hasFilterApplied = false;
            filterInfo.textContent = 'Tidak ada filter';
            filterInfo.style.color = '';
            
            // Disable download until filter applied
            downloadBtn.disabled = true;
            
            showMessage('Gambar berhasil diupload! Pilih filter untuk memulai pengolahan.', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Display image on canvas
// Display image on canvas
function displayImage(canvas, placeholder, img) {
    placeholder.style.display = 'none';
    
    // Dapatkan container parent
    const container = canvas.parentElement;
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;
    
    let width = img.width;
    let height = img.height;
    
    // Hitung skala untuk mempertahankan aspect ratio
    const scale = Math.min(maxWidth / width, maxHeight / height);
    
    // Jika gambar lebih besar dari container, perkecil
    if (scale < 1) {
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
    }
    // Jika gambar lebih kecil, biarkan ukuran asli tapi maksimal container
    else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
    }
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Draw image
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, width, height);
}

// Apply filter to image
function applyFilter(filterName) {
    if (!originalImage) return;
    
    console.log(`Memproses filter ${filterName} dengan intensitas ${intensity}`);
    
    // Hide after placeholder
    afterPlaceholder.style.display = 'none';
    
    // Create working canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Set size same as before canvas
    tempCanvas.width = beforeCanvas.width;
    tempCanvas.height = beforeCanvas.height;
    
    // Draw original image
    tempCtx.drawImage(originalImage, 0, 0, tempCanvas.width, tempCanvas.height);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Apply selected filter
    let resultData;
    const startTime = performance.now();
    
    try {
        switch(filterName) {
            case 'histogram':
                resultData = applyHistogramEqualization(imageData);
                break;
            case 'sharpen':
                resultData = applySharpenFilter(imageData, intensity);
                break;
            case 'median':
                resultData = applyMedianFilter(imageData, intensity);
                break;
            case 'contrast':
                resultData = applyContrastStretch(imageData);
                break;
            case 'unsharp':
                resultData = applyUnsharpMask(imageData, intensity);
                break;
            case 'gaussian':
                resultData = applyGaussianBlur(imageData, intensity);
                break;
            default:
                resultData = imageData;
        }
        
        // Put result back
        tempCtx.putImageData(resultData, 0, 0);
        
        // Display result
        const resultImg = new Image();
        resultImg.onload = () => {
            const ctx = afterCanvas.getContext('2d');
            afterCanvas.width = tempCanvas.width;
            afterCanvas.height = tempCanvas.height;
            ctx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
            ctx.drawImage(resultImg, 0, 0);
            processedImage = resultImg;
            
            const processTime = performance.now() - startTime;
            console.log(`Filter ${filterName} berhasil diterapkan (${processTime.toFixed(2)}ms)`);
            
            showMessage(`Filter berhasil diterapkan!`, 'success');
        };
        resultImg.src = tempCanvas.toDataURL();
        
    } catch (error) {
        console.error(`Error menerapkan filter ${filterName}:`, error);
        showMessage(`Terjadi kesalahan saat menerapkan filter`, 'error');
    }
}

// Handle intensity change
function handleIntensityChange() {
    intensity = parseInt(intensitySlider.value);
    intensityValue.textContent = intensity;
    
    if (originalImage && hasFilterApplied) {
        console.log(`Mengupdate intensitas filter ${currentFilter} ke ${intensity}`);
        applyFilter(currentFilter);
    }
}

// Reset application
function resetApplication() {
    if (originalImage) {
        // Clear after canvas
        const ctx = afterCanvas.getContext('2d');
        ctx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
        afterPlaceholder.style.display = 'flex';
        
        // Reset variables
        processedImage = null;
        currentFilter = null;
        hasFilterApplied = false;
        intensitySlider.value = 3;
        intensity = 3;
        intensityValue.textContent = '3';
        
        // Update info
        filterInfo.textContent = 'Tidak ada filter';
        filterInfo.style.color = '';
        
        // Disable download
        downloadBtn.disabled = true;
        
        console.log('Aplikasi direset');
        showMessage('Aplikasi berhasil direset', 'info');
    } else {
        showMessage('Belum ada gambar yang diupload', 'warning');
    }
}

// Download result
function downloadResult() {
    if (!processedImage) {
        showMessage('Pilih filter terlebih dahulu sebelum download', 'warning');
        return;
    }
    
    const filterName = currentFilter || 'processed';
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `FotoSharp_${filterName}_${timestamp}.png`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = afterCanvas.toDataURL('image/png');
    link.click();
    
    console.log(`Download berhasil: ${filename}`);
    showMessage('Gambar berhasil didownload!', 'success');
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
    
    console.log(`Theme diubah ke: ${newTheme}`);
}

// Update theme toggle button
function updateThemeToggle(theme) {
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Mode Terang';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Mode Gelap';
    }
}

// Show message
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : 
                     type === 'error' ? 'var(--danger-color)' : 
                     type === 'warning' ? 'var(--warning-color)' : 'var(--primary-color)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-size: 0.9rem;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Helper: Format file size
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

console.log('FotoSharp siap digunakan!');