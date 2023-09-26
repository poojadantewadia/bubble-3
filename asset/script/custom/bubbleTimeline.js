class BubbleTimelineChart {
  constructor(id) {
    this.id = id;
    this.ele = d3.select('#' + id);
    this.width = d3.select('#' + id).node().clientWidth;
    this.height = d3.select('#' + id).node().clientHeight;
    this.legendHeight = 120;
    this.margin = { top: 20, right: 50, bottom: 20, left: 20 };
    this.svg;
    this.radiusRange = [5, 50];
    this.cricleScale = d3.scaleLinear().range(this.radiusRange);
    this.xScale = d3.scaleTime().range(this, this.radiusRange);
    this.data;
    this.duration = 500;
    this.dataPath = 'asset/data/Dataset - Latino.csv';
    this.gXAxis;
    this.tooltip;
    this.legendOptionData = [
      { value: 3 },
      { value: 30 },
      { value: 60 }      
    ];
    this.loadData();
    this.mappingObject = [
      {
        label: 'Majority Latino Districts',
        filedValue: 'Majority Latino districts',
      },
      {
        label: 'Latino Representatives',
        filedValue: 'Latino members',
      },
      {
        label: '40-50% Latino Districts',
        filedValue: '40-50% Latino districts',
      },
    ];
    this.myColor = d3
      .scaleOrdinal()
      .domain([
        'Majority Latino districts',
        'Latino members',
        '40-50% Latino districts',
      ])
      .range(['rgb(64, 193, 201)', 'rgb(97, 65, 217)', 'rgb(217, 52, 161)']);
  }
  createEle() {
    this.tooltip = d3.select('#tooltip');
    this.svg = this.ele
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.svgG = this.svg
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );
    this.legendG = this.svgG.append('g').attr('class', 'legendG');
    const parenG = this.svgG
      .append('g')
      .attr('transform', 'translate(' + 0 + ',' + this.legendHeight + ')');

    this.gXAxis = parenG
      .append('g')
      .attr('class', 'gAxis')
      .attr('id', 'gAxis')
      .attr(
        'transform',
        'translate(0,' +
          (this.height -
            (this.legendHeight + this.margin.top + this.margin.bottom)) +
          ')'
      );
    // this.activeStateG = parenG.append('g').attr('class', 'activeStateG');

    this.cricleG = parenG.append('g').attr('class', 'cricleG');
    this.lineG = parenG.append('g').attr('class', 'lineG');    
  }
  // Get Data from JSON
  loadData() {
    this.createEle();
    d3.csv(this.dataPath).then((e) => {
      this.data = e;
      const getDate = this.data.map((d) => new Date(d['Year'] + '-1-1'));
      const getAllMajorityLatinoDistricts = this.data.map((d) =>
        Number(d['Majority Latino districts'])
      );
      const getAllLatinoRepresentatives = this.data.map((d) =>
        Number(d['Latino members'])
      );
      const getAll4050LatinoDistricts = this.data.map((d) =>
        Number(d['40-50% Latino districts'])
      );

      this.xScale = d3
        .scaleTime()
        .range([0, this.width - (this.margin.left + this.margin.right)])
        .domain(d3.extent(getDate));
    
      this.cricleScale.domain([
        0,
        d3.max([
          ...getAllMajorityLatinoDistricts,
          ...getAllLatinoRepresentatives,
          ...getAll4050LatinoDistricts,
        ]),
      ]);

      this.gXAxis.call(
        d3
          .axisBottom(this.xScale)
          .tickFormat(d3.timeFormat('%Y'))
          .tickValues(this.xScale.ticks(10).concat(this.xScale.domain()))
      );
      this.updateLegend();
      this.updatePath();
    });
    // });
  }

  resize() {
    this.width = d3.select('#' + this.id).node().clientWidth;
    this.height = d3.select('#' + this.id).node().clientHeight;
    this.xScale.range([0, this.width - (this.margin.left + this.margin.right)]);
    this.gXAxis.attr(
      'transform',
      'translate(0,' +
        (this.height -
          (this.legendHeight + this.margin.top + this.margin.bottom)) +
        ')'
    );
    this.gXAxis.call(
      d3
        .axisBottom(this.xScale)
        .tickFormat(d3.timeFormat('%Y'))
        .tickValues(this.xScale.ticks(10).concat(this.xScale.domain()))
    );
    this.svg.attr('width', this.width).attr('height', this.height);
    this.updateLegend();
    this.updatePath();
  }

  updateLegend() {
    const legendW = this.width - 300;
    const leftSide = this.legendG.selectAll('g').data([0]);
    leftSide.exit().remove();

    const updateLeftSide = leftSide
      .enter()
      .append('g')
      .merge(leftSide)
      .attr('transform', 'translate(' + legendW + ',' + -this.margin.top + ')');

    const dat = this.legendOptionData.map((d) => {
      const value = this.cricleScale(d.value);
      d.rediis = value;
      d.cy = this.legendHeight - value;
      d.cx = 100;
      d.text = d.value + '';
      return d;
    });

    const circle = updateLeftSide.selectAll('circle').data(dat);
    circle.exit().remove();
    circle
      .enter()
      .append('circle')
      .merge(circle)
      .attr('cx', (d) => d.cx)
      .attr('cy', (d) => d.cy)
      .attr('stroke-width', 1)
      .attr('stroke', 'rgb(0,0,0)')
      .attr('fill', 'rgb(91, 91, 91)')
      .attr('opacity', 0.3)
      .style('pointer-events', 'none')
      .attr('r', (d) => d.rediis);

    const line = updateLeftSide.selectAll('line').data(dat);
    line.exit().remove();
    line
      .enter()
      .append('line')
      .merge(line)
      .attr('x1', (d) => d.cx)
      .attr('y1', (d) => d.cy - d.rediis)
      .attr('x2', (d) => d.cx + 100)
      .attr('y2', (d) => d.cy - d.rediis)
      .attr('stroke-width', 1)
      .attr('stroke', 'rgb(0,0,0)')
      .attr('fill', 'rgb(37, 164, 99)')
      .attr('opacity', 0.3)
      .style('pointer-events', 'none');

    const leftText = updateLeftSide.selectAll('text').data(dat);
    leftText.exit().remove();
    leftText
      .enter()
      .append('text')
      .merge(leftText)
      .text((d) => d.text)
      .attr('x', (d) => d.cx + 100)
      .attr('y', (d) => d.cy - d.rediis)
      .attr('fill', 'rgb(118, 118, 118)')
      .attr('alignment-baseline', 'central')
      .attr('font-size', 14)
      .attr('pointer-events', 'none');
  }

  updatePath() {
    const height =
      this.height - (this.legendHeight + this.margin.top + this.margin.bottom);
    const perLineGeight = height / this.mappingObject.length;
    const selectLineG = this.lineG
      .selectAll('g.lineG')
      .data(this.mappingObject);
    selectLineG.exit().remove();
    const updateSelectLineG = selectLineG
      .enter()
      .append('g')
      .merge(selectLineG)
      .attr('class', (d) => 'lineG')
      .attr(
        'transform',
        (d, i) => 'translate(' + 0 + ',' + perLineGeight * i + ')'
      );

    const selectLine = updateSelectLineG.selectAll('line').data((d) => [d]);

    selectLine.exit().remove();
    selectLine
      .enter()
      .append('line')
      .merge(selectLine)
      .attr('x1', this.xScale(this.xScale.domain()[0]))
      .attr('x2', this.xScale(this.xScale.domain()[1]))
      .attr('y1', perLineGeight / 2)
      .attr('y2', perLineGeight / 2)
      .attr('stroke', (d) => this.myColor(d.label))
      .attr('stroke-width', 1)
      .attr('opacity', 0.4);
    const selectText = updateSelectLineG.selectAll('text').data((d) => [d]);

    selectText.exit().remove();
    selectText
      .enter()
      .append('text')
      .merge(selectText)
      .attr('x', this.xScale(this.xScale.domain()[0]))
      .attr('y', 22)
      // .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('font-size', '22px')
      .attr('fill', (d) => this.myColor(d.label))
      .text((d) => d.label);
    const self = this;

    const selectGCircle = updateSelectLineG
      .selectAll('g.circleG')
      .data((d) => [d]);

    selectGCircle.exit().remove();
    const updateGCricle = selectGCircle
      .enter()
      .append('g')
      .merge(selectGCircle)
      .attr('class', 'circleG ');

    const selectCircle = updateGCricle
      .selectAll('circle')
      .data((d) => this.getFilteData(d));

    selectCircle.exit().remove();
    selectCircle
      .enter()
      .append('circle')
      .merge(selectCircle)
      .attr('class', (d) => 'bubbles ' + d.Year)
      .attr('cx', (d) => {
        return this.xScale(d.Year);
      })
      .attr('cy', (d) => {
        return perLineGeight / 2;
      })
      .attr('r', (d) => {
        return this.cricleScale(d.value);
      })
      .style('stroke', (d) => {
        return 'rgb(91,91,91)';
      })
      .style('fill', (d) => {
        return this.myColor(d.label);
      })
      .attr('opacity', 0.4)
      .style('cursor', (d) => 'pointer')
      .on('mouseenter', function (d) {
        self.tooltip.transition().duration(200);
        const html = `<div style="color:black;font-size:15px; font-weight:bold;margin-bottom:1px;">${
          d.label
        }</div>
        <div style="color:black;margin-bottom:1px;">${d3.timeFormat('%Y')(
          d.Year
        )}</div>
        <div style="color:black">${d.value}</div>
        `;
        d3.select(this)
          .style('stroke', (d) => {
            return 'rgb(0,0,0)';
          })
          .attr('opacity', 0.6);
        self.tooltip
          .style('opacity', 1)
          .html(html)
          .style('top', d3.event.pageY - 28 + 'px');
        if (window.outerWidth <= d3.event.pageX + 230) {
          self.tooltip.style('left', d3.event.pageX - 230 + 'px');
        } else {
          self.tooltip.style('left', d3.event.pageX + 30 + 'px');
        }
      })
      .on('mousemove', function (d) {
        self.tooltip.style('top', d3.event.pageY - 28 + 'px');
        if (window.outerWidth <= d3.event.pageX + 230) {
          self.tooltip.style('left', d3.event.pageX - 230 + 'px');
        } else {
          self.tooltip.style('left', d3.event.pageX + 30 + 'px');
        }
      })
      .on('mouseleave', function (d) {
        d3.select(this)
          .style('stroke', (d) => {
            return 'rgb(91,91,91)';
          })
          .attr('opacity', 0.4);
        self.tooltip.style('opacity', 0);
      });
  }
  getFilteData(d) {
    const dat = this.data.map((e) => {
      return {
        filedValue: d.filedValue,
        value: e[d.filedValue],
        Year: new Date(e.Year + '-1-1'),
        label: d.label,
      };
    });

    return dat;
  }
}
