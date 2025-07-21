export const getStartDateFromRange = (range) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (range) {
      case 'today':
        return today;
      case 'week':
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);
        return lastWeek;
      case 'month':
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        return lastMonth;
      case 'quarter':
        const lastQuarter = new Date();
        lastQuarter.setMonth(now.getMonth() - 3);
        return lastQuarter;
      case 'year':
        const lastYear = new Date();
        lastYear.setFullYear(now.getFullYear() - 1);
        return lastYear;
      case 'total':
      default:
        return null;
    }
};

export const filterDataByDateRange = (data, range, dateField) => {
    if (!data || !Array.isArray(data)) return [];
    
    const startDate = getStartDateFromRange(range);
    if (!startDate) return data;

    return data.filter(item => {
        let itemDate;
        if (dateField.includes('.')) {
            const keys = dateField.split('.');
            itemDate = keys.reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : undefined, item);
        } else {
            itemDate = item[dateField];
        }
        
        if (!itemDate) return false;
        
        const date = new Date(itemDate);
        return !isNaN(date.getTime()) && date >= startDate;
    });
};