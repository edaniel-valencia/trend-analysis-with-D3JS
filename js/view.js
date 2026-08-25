export default class View {
  constructor(containerSelector) {
    this.container = d3.select(containerSelector);
    this.width = 800;
    this.height = 500;
    this.margin = { top: 40, right: 30, bottom: 40, left: 10 };
    this.duration = 1000;

    // A modern, dark-adjusted category scale
    this.colorScale = d3.scaleOrdinal(
      d3.schemeCategory10.map((color) => d3.hsl(color).darker(0.1).toString())
    );

    this.initSvg();
  }

  initSvg() {
    // Make it responsive using viewBox
    this.svg = this.container
      .append("svg")
      .attr("viewBox", `0 0 ${this.width + 100} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "auto")
      .classed("chart-svg", true);

    this.xScale = d3
      .scaleLinear()
      .range([this.margin.left, this.width - this.margin.right - 40]);

    this.yScale = d3
      .scaleBand()
      .range([this.height - this.margin.bottom, this.margin.top])
      .padding(0.15);

    this.xAxisGroup = this.svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`);

    this.yAxisGroup = this.svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${this.margin.left},0)`);

    this.yearLabel = this.svg
      .append("text")
      .attr("class", "year-label")
      .attr("x", this.width - this.margin.right - 20)
      .attr("y", this.margin.top + 30);
  }

  updateScales(maxVal, names) {
    this.xScale.domain([0, maxVal]);
    this.yScale.domain(names);

    this.xAxisGroup
      .transition()
      .duration(this.duration)
      .call(d3.axisBottom(this.xScale).ticks(5).tickSizeOuter(0));

    this.yAxisGroup.call(d3.axisLeft(this.yScale).tickSize(0).tickFormat(""));
    
    // Modernize axes styling
    this.svg.selectAll(".domain").style("stroke", "rgba(0, 0, 0, 0.2)");
    this.svg.selectAll(".tick line").style("stroke", "rgba(0, 0, 0, 0.1)");
    this.svg.selectAll(".tick text").style("fill", "rgba(0, 0, 0, 0.7)");
  }

  updateChart(filteredData, date) {
    // 1. Update Bars
    const bars = this.svg.selectAll(".bar").data(filteredData, (d) => d.name);

    bars.exit()
      .transition()
      .duration(this.duration)
      .attr("width", 0)
      .remove();

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", this.xScale(0))
      .attr("y", (d) => this.yScale(d.name))
      .attr("width", 0)
      .attr("height", this.yScale.bandwidth())
      .attr("fill", (d) => this.colorScale(d.name))
      .attr("rx", 4) // Rounded corners for premium feel
      .attr("ry", 4)
      .merge(bars)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      .attr("x", this.xScale(0))
      .attr("y", (d) => this.yScale(d.name))
      .attr("width", (d) => this.xScale(d.value))
      .attr("height", this.yScale.bandwidth())
      .attr("fill", (d) => this.colorScale(d.name));

    // 2. Update Labels
    const labels = this.svg.selectAll(".label").data(filteredData, (d) => d.name);

    labels.exit()
      .transition()
      .duration(this.duration)
      .attr("x", this.xScale(0))
      .remove();

    const newLabels = labels.enter()
      .append("text")
      .attr("class", "label")
      .attr("y", (d) => this.yScale(d.name) + this.yScale.bandwidth() / 2)
      .attr("x", this.xScale(0))
      .style("opacity", 0);

    newLabels.append("tspan")
      .attr("class", "label-name")
      .text((d) => d.name);

    newLabels.append("tspan")
      .attr("class", "label-value")
      .attr("dx", 8)
      .text((d) => d.value.toString());

    newLabels.merge(labels)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      .attr("x", (d) => this.xScale(d.value) + 10)
      .attr("y", (d) => this.yScale(d.name) + this.yScale.bandwidth() / 2)
      .style("opacity", 1);
      
    // Update texts inside merged labels
    this.svg.selectAll(".label").select(".label-name").text((d) => d.name);
    this.svg.selectAll(".label").select(".label-value")
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      // Animate text (tweening numbers is more complex, so we simply update)
      .text((d) => d.value.toLocaleString());

    // 3. Update Year
    this.yearLabel.text(date);
  }
}
