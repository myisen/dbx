import html2canvas from 'html2canvas'
import { showToast } from 'vant'

/**
 * Generate a share poster image from a DOM element
 * @param {HTMLElement} element - The DOM element to capture
 * @param {Object} options - html2canvas options
 * @returns {Promise<string>} - Base64 image data URL
 */
export async function generatePoster(element, options = {}) {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      allowTaint: true,
      ...options
    })
    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Poster generation failed:', error)
    showToast('海报生成失败')
    throw error
  }
}

/**
 * Download an image from a data URL
 * @param {string} dataUrl - The image data URL
 * @param {string} filename - The filename for download
 */
export function downloadImage(dataUrl, filename = 'poster.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Share via Web Share API (mobile-friendly)
 * @param {Object} data - { title, text, url, files }
 */
export async function webShare(data) {
  if (!navigator.share) {
    showToast('当前浏览器不支持分享')
    return false
  }
  try {
    await navigator.share(data)
    return true
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error)
    }
    return false
  }
}

/**
 * Copy text to clipboard
 * @param {string} text
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('已复制到剪贴板')
    return true
  } catch {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    showToast('已复制到剪贴板')
    return true
  }
}