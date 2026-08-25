import Model from './model.js';
import View from './view.js';

class Controller {
  constructor() {
    this.model = new Model();
    this.view = new View(".chart-container");
    this.timer = null;
  }

  async init() {
    try {
      await this.model.loadData("datos.csv");
      
      const maxVal = this.model.getMaxValue();
      const allNames = this.model.getAllNames();
      
      this.view.updateScales(maxVal, allNames);
      this.step();
      
      // Start loop
      this.playAnimation();
    } catch (error) {
      console.error("Failed to initialize visualization:", error);
    }
  }

  step() {
    const currentDate = this.model.getCurrentDate();
    const filteredData = this.model.getFilteredData(currentDate);
    this.view.updateChart(filteredData, currentDate);
  }

  playAnimation() {
    const loop = () => {
      this.model.getNextDate();
      this.step();
      this.timer = setTimeout(loop, this.view.duration);
    };
    
    // Initial delay before starting the loop
    this.timer = setTimeout(loop, this.view.duration);
  }

  stopAnimation() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

// Bootstrap the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new Controller();
  app.init();
});
