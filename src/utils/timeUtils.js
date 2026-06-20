/**
 * 格式化时间间隔
 * @param {number} duration - 时间间隔（毫秒）
 * @returns {string} 格式化后的时间字符串
 */
export const formatDuration = (duration) => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day(s) ${hours % 24} hour(s)`;
  }
  if (hours > 0) {
    return `${hours} hour(s) ${minutes % 60} min`;
  }
  if (minutes > 0) {
    return `${minutes} min`;
  }
  return 'Less than 1 min';
};

/**
 * 格式化日期时间
 * @param {string|Date} date - 日期对象或日期字符串
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
  if (!date) return 'Unknown time';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 计算剩余时间
 * @param {string|Date} endTime - 结束时间
 * @returns {string} 剩余时间字符串
 */
export const calculateTimeRemaining = (endTime) => {
  if (!endTime) return 'Unknown';
  
  const end = new Date(endTime);
  const now = new Date();
  const remaining = end - now;
  
  if (remaining <= 0) return 'Ended';
  return formatDuration(remaining);
}; 