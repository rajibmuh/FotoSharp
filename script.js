// script.js - FINAL WORKING VERSION - MEDIAN FILTER FIXED

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

// Variables
let originalImage = null;
let processedImage = null;
let currentFilter = null;
let intensity = 3;
let hasFilterApplied = false;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    console.log('FotoSharp started');
    
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
    intensitySlider.addEventListener('input', () => {
        intensity = parseInt(intensitySlider.value);
        intensityValue.textContent = intensity;
        if (originalImage && hasFilterApplied) {
            applyFilter(currentFilter);
        }
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
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
            
            // Disable download until filter applied
            downloadBtn.disabled = true;
            
            console.log('Reset completed');
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        if (!processedImage) {
            alert('Pilih filter terlebih dahulu');
            return;
        }
        const link = document.createElement('a');
        link.download = `fotosharp_${currentFilter}_${Date.now()}.png`;
        link.href = afterCanvas.toDataURL();
        link.click();
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!originalImage) {
                alert('Upload gambar terlebih dahulu');
                return;
            }
            
            currentFilter = btn.dataset.mode;
            hasFilterApplied = true;
            console.log(`Applying ${currentFilter} filter`);
            applyFilter(currentFilter);
            
            // Enable download button
            downloadBtn.disabled = false;
        });
    });
}

// Setup drag and drop
function setupDragDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
        dropArea.addEventListener(event, e => e.preventDefault());
    });
    
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
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
    // Validate
    if (!file.type.match('image.*')) {
        alert('Hanya file gambar (JPG, PNG, GIF)');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        alert('Maksimal 5MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = e => {
        const img = new Image();
        img.onload = () => {
            // Store original image
            originalImage = img;
            
            // Display in before canvas only
            displayImage(beforeCanvas, beforePlaceholder, img);
            
            // Clear after canvas
            const ctx = afterCanvas.getContext('2d');
            ctx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
            afterPlaceholder.style.display = 'flex';
            
            // Reset filter state
            processedImage = null;
            currentFilter = null;
            hasFilterApplied = false;
            
            // Disable download until filter applied
            downloadBtn.disabled = true;
            
            console.log('Image loaded. Select a filter to apply.');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Display image on canvas
function displayImage(canvas, placeholder, img) {
    placeholder.style.display = 'none';
    
    // Calculate dimensions
    const maxWidth = 450;
    const maxHeight = 300;
    
    let width = img.width;
    let height = img.height;
    
    // Scale to fit
    const scale = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
    
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
    
    console.log(`Processing ${filterName} with intensity ${intensity}`);
    
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
    switch(filterName) {
        case 'sharpen':
            resultData = applySharpenFilter(imageData);
            break;
        case 'median':
            resultData = applyMedianFilter(imageData);
            break;
        case 'contrast':
            resultData = applyContrastFilter(imageData);
            break;
        case 'unsharp':
            resultData = applyUnsharpMask(imageData);
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
        console.log(`${filterName} filter applied successfully`);
    };
    resultImg.src = tempCanvas.toDataURL();
}

// 1. Sharpen Filter - Working
function applySharpenFilter(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Sharpen strength
    const strength = intensity * 0.1;
    
    // Simple sharpen kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                // Get immediate neighbors
                const top = data[((y-1) * width + x) * 4 + c];
                const bottom = data[((y+1) * width + x) * 4 + c];
                const left = data[(y * width + (x-1)) * 4 + c];
                const right = data[(y * width + (x+1)) * 4 + c];
                const center = data[idx + c];
                
                // Simple sharpen formula
                const sharpened = center + (center - (top + bottom + left + right) / 4) * strength;
                
                output[idx + c] = clamp(sharpened);
            }
            output[idx + 3] = data[idx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

// 2. Median Filter - FIXED! (TIDAK BLUR)
function applyMedianFilter(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    // Create output array (copy of original)
    const output = new Uint8ClampedArray(data);
    
    // MEDIAN FILTER YANG BENAR:
    // 1. Window size kecil (3x3) 
    // 2. Hanya proses area yang noise, jangan semua
    // 3. Gunakan threshold untuk deteksi noise
    
    const windowSize = 3; // Tetap kecil
    const radius = Math.floor(windowSize / 2);
    
    // Iterasi melalui semua pixel kecuali border
    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                const center = data[idx + c];
                const values = [];
                
                // Kumpulkan nilai tetangga
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                        values.push(data[neighborIdx]);
                    }
                }
                
                // Hitung median
                values.sort((a, b) => a - b);
                const median = values[Math.floor(values.length / 2)];
                
                // Cek apakah pixel ini noise
                // Noise biasanya memiliki perbedaan besar dengan tetangga
                let isNoise = false;
                let similarCount = 0;
                
                for (let i = 0; i < values.length; i++) {
                    if (Math.abs(center - values[i]) < 30) { // Threshold
                        similarCount++;
                    }
                }
                
                // Jika kurang dari 3 tetangga yang similar, kemungkinan noise
                if (similarCount < 3) {
                    output[idx + c] = median; // Ganti dengan median
                } else {
                    output[idx + c] = center; // Pertahankan asli
                }
            }
            output[idx + 3] = data[idx + 3]; // Alpha channel
        }
    }
    
    return new ImageData(output, width, height);
}

// 3. Contrast Enhancement - Working
function applyContrastFilter(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Simple contrast adjustment
    const contrastFactor = 1.0 + (intensity * 0.15);
    
    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const value = data[i + c] / 255.0;
            
            // Apply contrast curve
            let adjusted;
            if (value < 0.5) {
                adjusted = Math.pow(value, contrastFactor);
            } else {
                adjusted = 1 - Math.pow(1 - value, contrastFactor);
            }
            
            output[i + c] = clamp(adjusted * 255);
        }
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
}

// 4. Unsharp Mask - Working
function applyUnsharpMask(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Step 1: Create blurred version
    const blurred = new Uint8ClampedArray(data.length);
    
    // Simple box blur (lebih cepat dari Gaussian)
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                // Average of 3x3 neighborhood
                let sum = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                        sum += data[neighborIdx];
                    }
                }
                blurred[idx + c] = Math.round(sum / 9);
            }
            blurred[idx + 3] = data[idx + 3];
        }
    }
    
    // Step 2: Apply unsharp mask
    const amount = intensity * 0.3;
    
    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const original = data[i + c];
            const blur = blurred[i + c];
            
            // Unsharp mask formula
            const sharpened = original + (original - blur) * amount;
            output[i + c] = clamp(sharpened);
        }
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
}

// Helper: Clamp value to 0-255
function clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
}

console.log('✅ FotoSharp ready!');
console.log('Filters: sharpen, median, contrast, unsharp');
console.log('Median Filter FIXED: tidak blur, hanya hilangkan noise');