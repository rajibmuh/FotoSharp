// linear.js - Implementasi MODUL 7: Linear Filtering (Gaussian Blur, Mean Filter)

// Helper: Buat Gaussian kernel
function createGaussianKernel(size, sigma) {
    const kernel = [];
    const center = Math.floor(size / 2);
    let sum = 0;
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - center;
            const dy = y - center;
            const value = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
            kernel.push(value);
            sum += value;
        }
    }
    
    // Normalisasi kernel
    return kernel.map(val => val / sum);
}

// Fungsi: Gaussian Blur (MODUL 7 - Linear Filtering)
function applyGaussianBlur(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    // Tentukan radius berdasarkan intensity (1-5)
    const radius = Math.floor(intensity);
    const kernelSize = radius * 2 + 1;
    
    // Buat Gaussian kernel
    const kernel = createGaussianKernel(kernelSize, intensity * 0.5);
    
    // Terapkan konvolusi dengan kernel Gaussian
    return applyConvolution(imageData, kernel);
}

// Fungsi: Mean Filter (MODUL 7 - Linear Filtering)
function applyMeanFilter(imageData, intensity) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    
    // Tentukan window size berdasarkan intensity
    const windowSize = intensity * 2 + 1; // 3, 5, 7, 9, 11
    const radius = Math.floor(windowSize / 2);
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let count = 0;
                
                // Akumulasi nilai dari window
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const px = x + dx;
                        const py = y + dy;
                        
                        if (px >= 0 && px < width && py >= 0 && py < height) {
                            const pixelIdx = (py * width + px) * 4 + c;
                            sum += data[pixelIdx];
                            count++;
                        }
                    }
                }
                
                // Hitung rata-rata
                output[idx + c] = clamp(sum / count);
            }
            output[idx + 3] = data[idx + 3]; // Alpha channel
        }
    }
    
    return new ImageData(output, width, height);
}

// Fungsi: Box Blur (varian dari Mean Filter)
function applyBoxBlur(imageData, intensity) {
    // Box blur adalah mean filter dengan window persegi
    return applyMeanFilter(imageData, Math.max(1, Math.floor(intensity / 2)));
}

// Export fungsi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyGaussianBlur,
        applyMeanFilter,
        applyBoxBlur,
        createGaussianKernel
    };
}