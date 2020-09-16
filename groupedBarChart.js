//2018, people whose income was below poverty level in CA
var promises = [
    //latinx males
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_010E&for=state:06'),//18-24
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_011E&for=state:06'),//25-34
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_012E&for=state:06'),//35-44
    //latinx females
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_024E&for=state:06'),//18-24
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_025E&for=state:06'),//25-34
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001I_026E&for=state:06'),//35-44
    //white, not hispanic or latino males
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_010E&for=state:06'),//18-24
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_011E&for=state:06'),//25-34
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_012E&for=state:06'),//35-44
    //white , not hispanic or latino females
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_024E&for=state:06'),//18-24
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_025E&for=state:06'),//25-34
    d3.json('https://api.census.gov/data/2018/acs/acs5?get=B17001H_026E&for=state:06')//35-44
    
    ]

Promise.all(promises).then(function(data){
    
    var Latinx = {
        group: 'Hispanic or LatinX',
        young: (+data[0][1][0] + (+data[3][1][0])),
        mid: (+data[1][1][0] + (+data[4][1][0])),
        old: (+data[2][1][0] + (+data[5][1][0]))
    }
    var White = {
        group: 'White Alone, not Hispanic or Latino',
        young: (+data[6][1][0] + (+data[9][1][0])),
        mid: (+data[7][1][0] + (+data[10][1][0])),
        old: (+data[8][1][0] + (+data[11][1][0]))
    }
    var sortedData = [Latinx, White];
    drawBarChart(sortedData);
    console.log(data)
    console.log(sortedData)
});

function drawBarChart(data){
    var width = 800;
    var height = 600;
    var svg = d3.select('body')
        .append('svg')
        .attr('transform', 'translate(100, 0)')
        .attr('width', width)
        .attr('height', height);
    
    var tooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
    
    var groups = Array.from(data, d => d.group);
    var subdata = [];
    data.forEach(function(elem){
        
        subdata.push({subgroup: 'young', value: elem.young});
        subdata.push({subgroup: 'mid', value: elem.mid});
        subdata.push({subgroup: 'old', value: elem.old});
    });
    var subgroups = Array.from(subdata, d => d.subgroup);
    console.log(subdata)
    
    var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding(0.2);
    
    var subx = d3.scaleBand()
        .domain(subgroups)
        .range([0, x.bandwidth()])
        .padding(0.05)
    
    var ymax = d3.max(subdata, d => d.value);
    console.log(ymax)
    var y = d3.scaleLinear()
        .domain([0, ymax])
        .range([height - 100, 20]).nice();
    
    var xAxis = d3.axisBottom(x).tickSizeOuter(0);
    var yAxis = d3.axisLeft(y);
    
    
    svg.append('g').attr('transform', 'translate(50,'+(height - 100)+')').call(xAxis);
    svg.append('g').attr('transform', 'translate(50, 0)').call(yAxis);
    let color1 = d3.schemeOrRd[9];
    let color2 = d3.schemeBuGn[9];
    let color = color2;
    var chart = svg.selectAll('.chart')
        .data(data)
        .enter()
        .append('g')
        .attr('id', 'ff')
        .attr('transform', d => 'translate('+(x(d.group)+100)+','+(height - 100)+')');
    
    var rect = chart.selectAll('rect')
        .data(function(d,i){return subdata.slice(i*3, (i*3)+3)})
        .enter()
        .append('rect')
        .attr('x', function(d){return subx(d.subgroup) - 100 + 50})
        .attr('y', function(d){return y(d.value) - (height - 100)})
        .attr('width', subx.bandwidth())
        .attr('height', function(d){return (height-100) - y(d.value)})
        .attr('fill', function(d, i){return color[i+2]});
    
    rect.on('mouseover', function(d){
        console.log('trigger')
        tooltip.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("background", color[1]);
        rect.style('cursor', 'none');
    }).on('mousemove', function(d){
        var val = d3.format(',')(d.value);
        tooltip.html(''+val+'')
        tooltip.style('left', (d3.event.pageX - 50)+'px');
        tooltip.style('top', (d3.event.pageY - 25)+'px');
    }).on('mouseout', function(d){
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    })
    
    console.log(subdata);
    var text = chart.selectAll('.textgroup')
        .data(function(d,i){return subdata.slice(i*3, (i*3)+3)})
        .enter()
        .append('text')
        .attr('x', function(d){return subx(d.subgroup) - 100 +50 + 20})
        .attr('y', function(d){return y(d.value) - (height - 100) - 10})
        .text(function(d){
            if(d.subgroup == 'young') return '18-24';
            if(d.subgroup == 'mid') return '25-34';
            if(d.subgroup == 'old') return '35-44';
            return 'n/a';
        });
    

    
    var body = d3.select('body');
    body.append('h4').text('Description/Features:')
    body.append('text').html('Visualization of Census Data for Poverty Status in CA with groups by race and subgroups by age.<br>'+
                             'Hover over bar for number of people in that subgroup')
    body.append('h4').text('Sources:')
    var ul = body.append('ul');
    ul.append('li').append('a')
        .attr('href', 'https://api.census.gov/data/2018/acs/acs5/groups/B17001I.html')
        .text('Poverty Status By Sex By Age (Hispanic or Latino)');
    ul.append('li').append('a')
        .attr('href', 'https://api.census.gov/data/2018/acs/acs5/groups/B17001H.html')
        .text('Poverty Status By Sex By Age (White Alone, Not Hispanic or Latino)');
    
    svg.append('text')
    .attr('x', width/2 - 20)
    .attr('y', height - 50)
    .text('(By age and race)')
    
    svg.selectAll('text')
    .style('font-family', 'Courier New')
    .style('font-weight', 'lighter');    
    
}