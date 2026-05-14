/**
 * Logic mã hóa và giải mã dữ liệu để chia sẻ qua URL
 * Sử dụng Key Mapping để tối ưu độ dài URL
 */

const KEY_MAP = {
    currentGpa: 'cg',
    currentCredits: 'cc',
    targetGpa: 'tg',
    newCredits: 'nc',
    totalCredits: 'tc',
    creditMode: 'cm',
    isRetake: 'ir',
    retakes: 'r',
    // Sub-keys for retakes
    oldGrade: 'og',
    credits: 'c'
};

const REV_MAP = Object.fromEntries(Object.entries(KEY_MAP).map(([k, v]) => [v, k]));

/**
 * Nén object state bằng cách rút gọn tên key
 */
function compressState(state) {
    const compressed = {};
    for (const key in state) {
        const shortKey = KEY_MAP[key] || key;
        let value = state[key];

        if (key === 'retakes' && Array.isArray(value)) {
            value = value.map(item => ({
                [KEY_MAP.oldGrade]: item.oldGrade,
                [KEY_MAP.credits]: item.credits
            }));
        } else if (key === 'creditMode') {
            value = value === 'total' ? 't' : 'n';
        } else if (typeof value === 'boolean') {
            value = value ? 1 : 0;
        }

        compressed[shortKey] = value;
    }
    return compressed;
}

/**
 * Giải nén object state về dạng ban đầu
 */
function decompressState(compressed) {
    const state = {};
    for (const shortKey in compressed) {
        const key = REV_MAP[shortKey] || shortKey;
        let value = compressed[shortKey];

        if (key === 'retakes' && Array.isArray(value)) {
            value = value.map(item => ({
                oldGrade: item[KEY_MAP.oldGrade],
                credits: item[KEY_MAP.credits]
            }));
        } else if (key === 'creditMode') {
            value = value === 't' ? 'total' : 'new';
        } else if (key === 'isRetake') {
            value = value === 1;
        }

        state[key] = value;
    }
    return state;
}

/**
 * Mã hóa object state thành một chuỗi cực ngắn
 */
export function encodeState(state) {
    try {
        const compressed = compressState(state);
        const jsonStr = JSON.stringify(compressed);
        // Base64 an toàn cho URL (thay thế +, /, = để tránh lỗi link)
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        return b64;
    } catch (e) {
        console.error("Lỗi mã hóa state:", e);
        return "";
    }
}

/**
 * Giải mã chuỗi từ URL thành object state
 */
export function decodeState(encodedStr) {
    try {
        // Khôi phục Base64 chuẩn
        let b64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        
        const jsonStr = decodeURIComponent(escape(atob(b64)));
        const compressed = JSON.parse(jsonStr);
        return decompressState(compressed);
    } catch (e) {
        console.error("Lỗi giải mã state:", e);
        return null;
    }
}

/**
 * Tạo link chia sẻ từ targetState hiện tại
 */
export function generateShareUrl(targetState) {
    const data = encodeState(targetState);
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('s', data); // Dùng 's' cho ngắn thay vì 'share'
    return url.toString();
}

