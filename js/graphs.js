    queue()
        .defer(d3.csv, "data/Salaries.csv")
        .await(makeGraphs);
   
    function makeGraphs(error, transactionsData) {
        var ndx = crossfilter(transactionsData);
   
    transactionsData.forEach(function(d){
      d.salary = parseFloat(d.salary);
            if (isNaN(d.salary)) {
                d.salary = 0;  
    }})
    
   
        var gender_dim = ndx.dimension(dc.pluck('sex'));
        var gender_measure = gender_dim.group();
   
        dc.barChart("#amount-men-women-chart")
            .width(500)
            .height(500)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(gender_dim)
            .group(gender_measure)
            .transitionDuration(500)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Gender")
            .yAxis().ticks(20);
            
        
        var earning_dim = ndx.dimension(dc.pluck('sex'));
        
            function add_item(p, v) {
                p.count++;
                p.total += v.salary;
                p.average = p.total / p.count;
                return p;
            }
        
        
            function remove_item(p, v) {
                p.count--;
                if(p.count == 0){
                    p.total = 0;
                    p.average = 0;
                } else {
                    p.total -= v.salary;
                    p.average = p.total / p.count;
                }
                return p;
            }
        
            function init() {
                return { count: 0, total: 0, average: 0 };
            }
            
        var earning_measure = earning_dim.group().reduce(add_item, remove_item, init);
        
        
        dc.barChart("#earnings-chart")
            .width(500)
            .height(500)
            .margins({top: 10, right: 50, bottom: 30, left: 50})
            .dimension(earning_dim)
            .group(earning_measure)
            .valueAccessor(function (d) {
                console.log(d.value.average);
                return d.value.average;
            })
            .transitionDuration(500)
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Gender")
            .yAxis().ticks(4);
        
        
        var rank_distribution_dim = ndx.dimension(dc.pluck('sex'));
        
        var rank_prof = rank_distribution_dim.group().reduceSum(function (d) {
                if (d.rank === 'Prof') {
                    return +d.rank;
                } else {
                    return 0;
                }
            });
        var rank_asst = rank_distribution_dim.group().reduceSum(function (d) {
            if (d.rank === 'AsstProf') {
                return +d.rank;
            } else {
                return 0;
            }
        });
        var rank_assoc_prof = rank_distribution_dim.group().reduceSum(function (d) {
            if (d.rank === 'AssocProf') {
                return +d.rank;
            } else {
                return 0;
            }
        });
        
   
        var stackedChart = dc.barChart("#distributions-chart");
        stackedChart
            .width(500)
            .height(500)
            .dimension(rank_distribution_dim)
            .group(rank_prof, "Prof")
            .stack(rank_asst, "AsstProf")
            .stack(rank_assoc_prof, "AssocProf")
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .brushOn(false)
            .legend(dc.legend().x(420).y(0).itemHeight(15).gap(5));
            stackedChart.margins().right = 100;
    
        dc.renderAll();
    };
