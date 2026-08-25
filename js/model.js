export default class Model {
  constructor() {
    this.data = [];
    this.dates = [];
    this.categories = [];
    this.currentDateIndex = 0;
  }

  async loadData(url) {
    try {
      const rawData = await d3.csv(url, (d) => ({
        date: d.date,
        name: d.name,
        category: d.category,
        value: +d.value,
      }));

      this.data = rawData;
      this.categories = Array.from(new Set(this.data.map((d) => d.category)));
      this.dates = Array.from(new Set(this.data.map((d) => d.date)));
      return this.data;
    } catch (error) {
      console.error("Error loading data:", error);
      throw error;
    }
  }

  getFilteredData(date) {
    return this.data.filter((d) => d.date === date);
  }

  getMaxValue() {
    return d3.max(this.data, (d) => d.value);
  }

  getAllNames() {
    return Array.from(new Set(this.data.map((d) => d.name)));
  }

  getCurrentDate() {
    return this.dates[this.currentDateIndex];
  }

  getNextDate() {
    this.currentDateIndex++;
    if (this.currentDateIndex >= this.dates.length) {
      this.currentDateIndex = 0;
    }
    return this.dates[this.currentDateIndex];
  }

  resetDateIndex() {
    this.currentDateIndex = 0;
  }
}
