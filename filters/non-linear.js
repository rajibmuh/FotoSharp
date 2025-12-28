// non-linear.js - Implementasi MODUL 7: Non-linear Filtering (Median Filter)

// Fungsi: Median Filter (MODUL 7 - Non-linear Filtering) - IMPROVED
function applyMedianFilter(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data);
    
    // Tentukan window size berdasarkan intensity (tetap kecil untuk hindari blur berlebihan)
    const windowSize = 3; // Tetap 3x3 untuk menjaga detail
    const radius = Math.floor(windowSize / 2);
    const windowArea = windowSize * windowSize;
    
    // Buffer untuk nilai-nilai dalam window
    const rValues = new Array(windowArea);
    const gValues = new Array(windowArea);
    const bValues = new Array(windowArea);
    
    // Iterasi melalui semua pixel kecuali border
    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;
            
            let pos = 0;
            
            // Kumpulkan nilai dari window 3x3
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const pixelIdx = ((y + dy) * width + (x + dx)) * 4;
                    
                    rValues[pos] = data[pixelIdx];
                    gValues[pos] = data[pixelIdx + 1];
                    bValues[pos] = data[pixelIdx + 2];
                    pos++;
                }
            }
            
            // Urutkan nilai untuk cari median
            rValues.sort((a, b) => a - b);
            gValues.sort((a, b) => a - b);
            bValues.sort((a, b) => a - b);
            
            const medianIndex = Math.floor(windowArea / 2);
            
            // Terapkan median hanya jika pixel kemungkinan noise
            // Deteksi noise: jika pixel sangat berbeda dari median
            const centerR = data[idx];
            const centerG = data[idx + 1];
            const centerB = data[idx + 2];
            
            const medianR = rValues[medianIndex];
            const medianG = gValues[medianIndex];
            const medianB = bValues[medianIndex];
            
            // Threshold untuk deteksi noise (berdasarkan intensity)
            const noiseThreshold = 40 - (intensity * 5);
            
            // Hitung perbedaan dari median
            const diffR = Math.abs(centerR - medianR);
            const diffG = Math.abs(centerG - medianG);
            const diffB = Math.abs(centerB - medianB);
            
            // Jika salah satu channel memiliki perbedaan besar, ganti dengan median
            if (diffR > noiseThreshold || diffG > noiseThreshold || diffB > noiseThreshold) {
                output[idx] = medianR;
                output[idx + 1] = medianG;
                output[idx + 2] = medianB;
            }
            // Jika tidak, biarkan nilai asli
        }
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Min Filter (Non-linear)
function applyMinFilter(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    const windowSize = 3;
    const radius = 1;
    
    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let minVal = 255;
                
                // Cari nilai minimum dalam window
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const pixelIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                        minVal = Math.min(minVal, data[pixelIdx]);
                    }
                }
                
                output[idx + c] = minVal;
            }
            output[idx + 3] = data[idx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Max Filter (Non-linear)
function applyMaxFilter(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    const windowSize = 3;
    const radius = 1;
    
    for (let y = radius; y < height - radius; y++) {
        for (let x = radius; x < width - radius; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let maxVal = 0;
                
                // Cari nilai maximum dalam window
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const pixelIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                        maxVal = Math.max(maxVal, data[pixelIdx]);
                    }
                }
                
                output[idx + c] = maxVal;
            }
            output[idx + 3] = data[idx + 3];
        }
    }
    
    return new ImageData(output, width, height);
}

// Export fungsi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyMedianFilter,
        applyMinFilter,
        applyMaxFilter
    };
}