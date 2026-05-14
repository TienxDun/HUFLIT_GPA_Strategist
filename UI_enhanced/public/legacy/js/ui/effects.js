export function initSnowEffect() {
    // Disabled
}

/**
 * Hiệu ứng chạy số tự động từ giá trị cũ đến giá trị mới
 * @param {HTMLElement} element - Phần tử chứa số
 * @param {number} start - Giá trị bắt đầu
 * @param {number} end - Giá trị kết thúc
 * @param {number} duration - Thời gian chạy (ms)
 * @param {number} decimals - Số chữ số thập phân
 */
export function animateValue(element, start, end, duration = 1000, decimals = 2) {
    if (!element) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = progress * (end - start) + start;

        // Format based on value
        if (isNaN(value)) {
            element.innerHTML = end;
            return;
        }

        element.innerHTML = value.toFixed(decimals);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/**
 * Kích hoạt rung phản hồi (Haptic Feedback) trên thiết bị di động
 * @param {number} duration - Thời gian rung (ms), mặc định 10ms (rung nhẹ)
 */
export function triggerHapticFeedback(duration = 10) {
    // Chỉ rung nếu thiết bị hỗ trợ và người dùng đang thao tác
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

export function initChristmasTreeInteraction() {
    // Disabled
}

/**
 * Hiển thị toast notification thay thế alert()
 * @param {string} message - Nội dung thông báo
 * @param {string} type - Loại: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Thời gian hiển thị (ms)
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Tạo container nếu chưa có
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Màu sắc theo type
    const colors = {
        info: { bg: '#0dcaf0', icon: 'bi-info-circle' },
        success: { bg: '#198754', icon: 'bi-check-circle' },
        warning: { bg: '#ffc107', icon: 'bi-exclamation-triangle' },
        error: { bg: '#dc3545', icon: 'bi-x-circle' }
    };
    const color = colors[type] || colors.info;

    // Tạo toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${color.bg};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 280px;
        max-width: 400px;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;
    toast.innerHTML = `
        <i class="bi ${color.icon}"></i>
        <span style="flex: 1;">${message}</span>
        <i class="bi bi-x" style="opacity: 0.7;"></i>
    `;

    // Click để đóng
    toast.addEventListener('click', () => removeToast(toast));

    container.appendChild(toast);

    // Tự động đóng sau duration
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
}
