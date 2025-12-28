// histogram.js - Implementasi MODUL 3 & 6: Histogram Equalization & Contrast Stretch

// Fungsi utama: Histogram Equalization (MODUL 6)
function applyHistogramEqualization(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // 1. Hitung histogram untuk setiap channel RGB
    const histR = new Array(256).fill(0);
    const histG = new Array(256).fill(0);
    const histB = new Array(256).fill(0);
    
    for (let i = 0; i < data.length; i += 4) {
        histR[data[i]]++;
        histG[data[i + 1]]++;
        histB[data[i + 2]]++;
    }
    
    // 2. Hitung cumulative histogram
    const cumR = calculateCumulativeHistogram(histR);
    const cumG = calculateCumulativeHistogram(histG);
    const cumB = calculateCumulativeHistogram(histB);
    
    // 3. Hitung total pixels
    const totalPixels = width * height;
    
    // 4. Buat lookup table untuk equalization
    const lookupR = new Array(256);
    const lookupG = new Array(256);
    const lookupB = new Array(256);
    
    for (let i = 0; i < 256; i++) {
        lookupR[i] = clamp((cumR[i] / totalPixels) * 255);
        lookupG[i] = clamp((cumG[i] / totalPixels) * 255);
        lookupB[i] = clamp((cumB[i] / totalPixels) * 255);
    }
    
    // 5. Terapkan equalization ke setiap pixel
    for (let i = 0; i < data.length; i += 4) {
        output[i] = lookupR[data[i]];
        output[i + 1] = lookupG[data[i + 1]];
        output[i + 2] = lookupB[data[i + 2]];
        output[i + 3] = data[i + 3]; // Alpha channel
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Contrast Stretching (MODUL 3)
function applyContrastStretch(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // 1. Temukan nilai minimum dan maximum untuk setiap channel
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;
    
    for (let i = 0; i < data.length; i += 4) {
        minR = Math.min(minR, data[i]);
        maxR = Math.max(maxR, data[i]);
        minG = Math.min(minG, data[i + 1]);
        maxG = Math.max(maxG, data[i + 1]);
        minB = Math.min(minB, data[i + 2]);
        maxB = Math.max(maxB, data[i + 2]);
    }
    
    // 2. Hitung range untuk setiap channel
    const rangeR = maxR - minR || 1;
    const rangeG = maxG - minG || 1;
    const rangeB = maxB - minB || 1;
    
    // 3. Terapkan contrast stretching formula
    for (let i = 0; i < data.length; i += 4) {
        output[i] = clamp(((data[i] - minR) / rangeR) * 255);
        output[i + 1] = clamp(((data[i + 1] - minG) / rangeG) * 255);
        output[i + 2] = clamp(((data[i + 2] - minB) / rangeB) * 255);
        output[i + 3] = data[i + 3]; // Alpha channel
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Brightness Adjustment (MODUL 3)
function applyBrightnessAdjustment(imageData, intensity) {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Faktor brightness berdasarkan intensity
    const factor = (intensity - 3) * 20; // -40 sampai +40
    
    for (let i = 0; i < data.length; i += 4) {
        output[i] = clamp(data[i] + factor);
        output[i + 1] = clamp(data[i + 1] + factor);
        output[i + 2] = clamp(data[i + 2] + factor);
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, imageData.width, imageData.height);
}

// Export fungsi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyHistogramEqualization,
        applyContrastStretch,
        applyBrightnessAdjustment
    };
}