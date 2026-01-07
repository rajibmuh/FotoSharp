// convolution.js - Implementasi MODUL 6: Konvolusi (Sharpen, Unsharp Mask)

// Fungsi: Sharpen Filter (MODUL 6)
function applySharpenFilter(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Sharpen kernel berdasarkan intensity
    const strength = intensity * 0.15;
    
    // Kernel sharpen dasar
    const kernel = [
        0, -1 * strength, 0,
        -1 * strength, 1 + 4 * strength, -1 * strength,
        0, -1 * strength, 0
    ];
    
    // Terapkan kernel 3x3
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let kIndex = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += data[pixelIdx] * kernel[kIndex];
                        kIndex++;
                    }
                }
                
                output[idx + c] = clamp(sum);
            }
            output[idx + 3] = data[idx + 3]; // Alpha channel
        }
    }
    
    // Copy border pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                const idx = (y * width + x) * 4;
                output[idx] = data[idx];
                output[idx + 1] = data[idx + 1];
                output[idx + 2] = data[idx + 2];
                output[idx + 3] = data[idx + 3];
            }
        }
    }
    
    return new ImageData(output, width, height);
}

// Helper function untuk Gaussian blur (diperlukan untuk unsharp mask)
function simpleGaussianBlur(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Simple 3x3 Gaussian kernel
    const kernel = [
        1/16, 2/16, 1/16,
        2/16, 4/16, 2/16,
        1/16, 2/16, 1/16
    ];
    
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let kIndex = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += data[pixelIdx] * kernel[kIndex];
                        kIndex++;
                    }
                }
                
                output[idx + c] = clamp(sum);
            }
            output[idx + 3] = data[idx + 3];
        }
    }
    
    // Copy border pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                const idx = (y * width + x) * 4;
                output[idx] = data[idx];
                output[idx + 1] = data[idx + 1];
                output[idx + 2] = data[idx + 2];
                output[idx + 3] = data[idx + 3];
            }
        }
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Unsharp Mask (MODUL 6)
function applyUnsharpMask(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Step 1: Buat gambar blur
    const blurred = simpleGaussianBlur(imageData);
    
    // Step 2: Hitung mask (original - blurred)
    const mask = new Uint8ClampedArray(data.length);
    
    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            mask[i + c] = data[i + c] - blurred.data[i + c];
        }
        mask[i + 3] = data[i + 3];
    }
    
    // Step 3: Terapkan mask dengan amount berdasarkan intensity
    const amount = intensity * 0.25;
    
    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const sharpened = data[i + c] + mask[i + c] * amount;
            output[i + c] = clamp(sharpened);
        }
        output[i + 3] = data[i + 3];
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Edge Enhancement (Laplacian) - MODUL 6
function applyEdgeEnhancement(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Laplacian kernel untuk edge detection
    const kernel = [
        -1, -1, -1,
        -1,  8, -1,
        -1, -1, -1
    ];
    
    // Terapkan kernel
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let kIndex = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const pixelIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += data[pixelIdx] * kernel[kIndex];
                        kIndex++;
                    }
                }
                
                // Tambahkan edge ke original dengan intensitas
                const enhanced = data[idx + c] + sum * (intensity * 0.1);
                output[idx + c] = clamp(enhanced);
            }
            output[idx + 3] = data[idx + 3];
        }
    }
    
    // Copy border pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                const idx = (y * width + x) * 4;
                output[idx] = data[idx];
                output[idx + 1] = data[idx + 1];
                output[idx + 2] = data[idx + 2];
                output[idx + 3] = data[idx + 3];
            }
        }
    }
    
    return new ImageData(output, width, height);
}

// Export fungsi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applySharpenFilter,
        applyUnsharpMask,
        applyEdgeEnhancement
    };
}