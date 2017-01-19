google.charts.load('visualization', '1.1', {'packages':['geochart', 'controls', 'table', 'corechart', 'bar']});
google.charts.setOnLoadCallback(drawRegionsMap);

function drawRegionsMap() {

    /**
     *   COLUMNS MAPPING:
     *
     *   0   ->  Region             30  ->  Target Shipments    60  ->  Sales target M4
     *   1   ->  Market             31  ->  LY Ship M1          61  ->  Sales target M5
     *   2   ->  Rep. Market        32  ->  LY Ship M2          62  ->  Sales target M6
     *   3   ->  Brand              33  ->  LY Ship M3          63  ->  Sales target M7
     *   4   ->  Variant            34  ->  LY Ship M4          64  ->  Sales target M8
     *   5   ->  Ship M1            35  ->  LY Ship M5          65  ->  Sales target M9
     *   6   ->  Ship M2            36  ->  LY Ship M6          66  ->  Sales target M10
     *   7   ->  Ship M3            37  ->  LY Ship M7          67  ->  Sales target M11
     *   8   ->  Ship M4            38  ->  LY Ship M8          68  ->  Sales target M12
     *   9   ->  Ship M5            39  ->  LY Ship M9          69  ->  Target Sales
     *   10  ->  Ship M6            40  ->  LY Ship M10         70  ->  LY Sales M1
     *   11  ->  Ship M7            41  ->  LY Ship M11         71  ->  LY Sales M2
     *   12  ->  Ship M8            42  ->  LY Ship M12         72  ->  LY Sales M3
     *   13  ->  Ship M9            43  ->  Last Year Shipments 73  ->  LY Sales M4
     *   14  ->  Ship M10           44  ->  Sales M1            74  ->  LY Sales M5
     *   15  ->  Ship M11           45  ->  Sales M2            75  ->  LY Sales M6
     *   16  ->  Ship M12           46  ->  Sales M3            76  ->  LY Sales M7
     *   17  ->  Shipments          47  ->  Sales M4            77  ->  LY Sales M8
     *   18  ->  Ship target M1     48  ->  Sales M5            78  ->  LY Sales M9
     *   19  ->  Ship target M2     49  ->  Sales M6            79  ->  LY Sales M10
     *   10  ->  Ship target M3     50  ->  Sales M7            80  ->  LY Sales M11
     *   21  ->  Ship target M4     51  ->  Sales M8            81  ->  LY Sales M12
     *   22  ->  Ship target M5     52  ->  Sales M9            82  ->  Last Year Sales
     *   23  ->  Ship target M6     53  ->  Sales M10
     *   24  ->  Ship target M7     54  ->  Sales M11
     *   25  ->  Ship target M8     55  ->  Sales M12
     *   26  ->  Ship target M9     56  ->  Sales
     *   27  ->  Ship target M10    57  ->  Sales target M1
     *   28  ->  Ship target M11    58  ->  Sales target M2
     *   29  ->  Ship target M12    59  ->  Sales target M3
     */

    // Dashboard where the graphs and controls are handled
    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
    // DataTable with the raw data from Excel
    var data = new google.visualization.DataTable();
    // Default column to display = 17 (Shipments)
    var colDisplayed = 17;
    // Default resolution displayed = continents
    var resDisplayed = 'continents';
    // Default name column (continents = 0, subcontinents = 1 or countries = 2). Changes along with resDisplayed
    var areaDisplayed = 0
    // Default map focus
    var mapFoc = 'world';
    // map options
    var mapOptions;
    // DataView linked to the DataTable 'data'
    var dataView;
    // Aggregated data used for the maps and bar charts. Elements are added from the DataView by using the areaDisplayed as index. e.g. 
    // if continents is selected, rows with the same continent will be aggregated (added) into a single one, representing the figures 
    // of all entries of that area
    var dataViewAggr;
    // Table filtered data, filtered whenever a region is clicked on the map
    var tableView;
    // Data formatted for the bar charts
    var chartTable = new google.visualization.DataTable();
    var chart1Data;
    var chart2Data;
    var chart3Data;
    var chart4Data;
    // The geoChart object to display the map
    var map = new google.visualization.GeoChart(document.getElementById('regions_div'));
    // Table displaying data from the selected region
    var table = new google.visualization.Table(document.getElementById('table_div'));
    // Charts displaying data from the selected region
    var chart1 = new google.visualization.ColumnChart(document.getElementById('chart1_div'));
    var chart2 = new google.visualization.ColumnChart(document.getElementById('chart2_div'));
    var chart3 = new google.visualization.ColumnChart(document.getElementById('chart3_div'));
    var chart4 = new google.visualization.ColumnChart(document.getElementById('chart4_div'));
    // For conversion number -> month string
    var monthMap = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Array containing brands
    var brandsArray = [];

    // Columns generation
    var i = 0;
    for (var key in importedData[0]) {
        if (i<5)
            data.addColumn('string', key);
        else
            data.addColumn('number', key);
        i++;
    }
    
    // Bar charts columns generation
    chartTable.addColumn('string', 'Month');
    chartTable.addColumn('number', '');
    chartTable.addColumn('number', '');
    for (var k=0; k<12; k++)
            chartTable.addRow([monthMap[k], 0, 0]);

//       		data.addColumn('string', 'Region');
//       		data.addColumn('string', 'Market');
//       		data.addColumn('string', 'Reporting Market');
//       		data.addColumn('number', 'Ship');
//       		data.addColumn('number', 'Ship Target');
//       		data.addColumn('number', 'LY Ship');
//       		data.addColumn('number', 'Sales');
//       		data.addColumn('number', 'Sales Target');
//       		data.addColumn('number', 'LY Sales');
//       		data.addColumn('string', 'Brand');
//       		data.addRows([
//        		['002', '014', 'Tanzania',        6453, 2000, 3456, 6485, 7456, 3003, 'A'],
//        		['002', '011', 'Nigeria',         6433, 2854, 6543, 2004, 4556, 3003, 'B'],
//        		['002', '015', 'Ghana',           8353, 8546, 4567, 3544, 2400, 3452, 'A'],
//        		['150', '154', 'Denmark',         2443, 2000, 7654, 3445, 7554, 3003, 'C'],
//        		['150', '154', 'Estonia',         9453, 2454, 5678, 7534, 2400, 6432, 'B'],
//        		['150', '155', 'Austria',         2276, 1854, 9876, 2020, 6645, 6453, 'A'],
//        		['150', '039', 'Greece',          6574, 5648, 6789, 5344, 3345, 3004, 'C'],
//        		['150', '151', 'Russia',          9553, 7453, 3456, 7455, 2600, 5433, 'C'],
//        		['019', '021', 'United States',   8644, 7354, 6543, 7554, 2700, 2334, 'A'],
//        		['019', '021', 'Canada',          1363, 7548, 2345, 2355, 7445, 3040, 'B'],
//        		['019', '013', 'Mexico',          3647, 2734, 5432, 1253, 2070, 8526, 'D'],
//        		['019', '013', 'Mexico',          2454, 3485, 3456, 6443, 2040, 3030, 'A'],
//        		['019', '013', 'Mexico',          5323, 2000, 2345, 2336, 7554, 3254, 'C'],
//        		['019', '029', 'Cuba',            2453, 5965, 6234, 7524, 6435, 4543, 'A'],
//        		['019', '013', 'Belize',          2754, 5679, 7345, 8576, 6345, 2334, 'C'],
//        		['019', '005', 'Bolivia',         8434, 5067, 4576, 3545, 6243, 7425, 'B'],
//        		['142', '143', 'Turkemistan',     7443, 5646, 8245, 7445, 2300, 3345, 'B'],
//        		['142', '030', 'China',           2753, 5685, 8345, 8556, 2040, 4556, 'A'],
//        		['142', '030', 'Mongolia',        2846, 1234, 7453, 3445, 4344, 5657, 'C'],
//        		['142', '034', 'Afghanistan',     7344, 2345, 4573, 3456, 5355, 6578, 'C'],
//        		['142', '034', 'India',           4577, 3456, 7345, 7435, 2020, 7859, 'B'],
//        		['142', '035', 'Indonesia',       8565, 4567, 3000, 2500, 3345, 8940, 'B'],
//        		['142', '145', 'Armenia',         3455, 5678, 7543, 8745, 6334, 6543, 'B'],
//        		['009', '053', 'Australia',       2856, 6789, 7458, 9746, 6433, 5433, 'C'],
//        		['009', '053', 'New Zealand',     8456, 7890, 4586, 7356, 6366, 6354, 'A'],
//        		['009', '054', 'Fiji',            2574, 7654, 9657, 4546, 7737, 7365, 'A'],
//       		]);

    for (var k=0; k<importedData.length; k++) {
        var newRow = [];
        for (var key in importedData[k])
            newRow.push(importedData[k][key]);
        data.addRow(newRow);
    }

    // Populate table data into a DataView (not a DataTable!!)
    dataView = new google.visualization.DataView(data);

    // Add checkboxes based on the set of brands found in the table
    addCheckbox();

    // Initial draw of the map 
    redrawMap();

    //option 2, just selecting rows 2, 3 and 4 for the output   NOT IN USE RIGHT NOW---!
    //var view = new google.visualization.DataView(data);
    //view.setColumns([2,3, 4]);

    //example of how to do calculations (e.g. maybe we want to sum all 12 periods?) on table ----!
    // Underlying table has a column specifying a value in centimeters.               
    // The view imports this directly, and creates a calculated addColumn            
    // that converts the value into inches.                                           
    //view.setColumns([1,{calc:cmToInches, type:'number', label:'Height in Inches'}]);  
    //  function cmToInches(dataTable, rowNum){                                         
    //    return Math.floor(dataTable.getValue(rowNum, 1) / 2.54);                      
    //  }                                                                               


    // Draws or redraws the map with the selected options and data
/*   			function redrawMap(){
        // Select which column to aggregate by (areaDisplayed) and which data column to display (colDisplayed) in the map
        aggregated = google.visualization.data.group(data, [areaDisplayed], [{'column': colDisplayed, 'aggregation': google.visualization.data.sum, 'type': 'number'}]);
        mapOptions = {
            region: 'world', 
            resolution: resDisplayed,
            backgroundColor: {fill: '#81d4fa', stroke: '#000000', strokeWidth: 1},
            colorAxis: {colors: ['#f4ee42', '#46ad13']},
            enableRegionInteractivity: 'true',
        };  
        // draw / redraw map
        map.draw(aggregated, mapOptions); 				
    }
*/

    // Function to add checkboxes based on the set of brands found in the table
//            function addCheckbox() {
//                var form = document.getElementById('brandsForm');
//                
//                for (var i=0; i<data.getNumberOfRows(); i++) {
//                    for (var j=0; j<brandsArray.length; j++) {
//                        if (data.getValue(i, 3) == brandsArray[j].brand)
//                            break;
//                    }
//                    if (j == brandsArray.length) {
//                        var cb = document.createElement('input');
//                        cb.type = 'checkbox';
//                        cb.name = 'brand';
//                        cb.value = data.getValue(i, 3);
//                        cb.setAttribute("onclick","javascript:filterBrand(this);");
//                        cb.checked = true;
//
//                        form.appendChild(cb);
//                        form.appendChild(document.createTextNode(data.getValue(i, 3)));
//                        form.appendChild(document.createElement('br'));
//
//                        brandsArray.push({brand: data.getValue(i, 3), checked: 'true'});
//                    }
//                }
//            }

    function addCheckbox() {
        var form = document.getElementById('brandsForm');

        for (var i=0; i<data.getNumberOfRows(); i++) {
            for (var j=0; j<brandsArray.length; j++) {
                if (data.getValue(i, 3) == brandsArray[j].brand)
                    break;
            }
            if (j == brandsArray.length)
                brandsArray.push({brand: data.getValue(i, 3), checked: 'true'});
        }

        brandsArray.sort(function(a, b){
            var x = a.brand.toLowerCase();
            var y = b.brand.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });

        for (var i=0; i<brandsArray.length; i++) {
            var cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.name = 'brand';
            cb.value = brandsArray[i]['brand'];
            cb.setAttribute("onclick","javascript:filterBrand(this);");
            cb.checked = true;

            form.appendChild(cb);
            form.appendChild(document.createTextNode(cb.value));
            form.appendChild(document.createElement('br'));   
        }
    }

    // Draws or redraws the map with the selected options and data
    function redrawMap(){
        // Select which column to aggregate by (areaDisplayed) and which data column to display (colDisplayed) in the map


        dataView.setRows(data.getFilteredRows([{
            column: 3, 
            test: function (value, row, column, table) {
                var res = false;
                for (var i=0; i<brandsArray.length; i++) {
                    if ((brandsArray[i].brand == value) && (brandsArray[i].checked)) {
                        res = true;
                        break;
                    }
                }
                return (res);
            }
        }]));

        dataViewAggr = google.visualization.data.group(dataView, [areaDisplayed], [{'column': colDisplayed, 'aggregation': google.visualization.data.sum, 'type': 'number'}]);
        mapOptions = {
            region: mapFoc, 
            resolution: resDisplayed,
            backgroundColor: {fill: '#81d4fa', stroke: '#000000', strokeWidth: 0},
            colorAxis: {colors: ['#f4ee42', '#46ad13']},
            enableRegionInteractivity: 'true',
            tooltip: {
                    isHtml: true,
                    showTitle: (resDisplayed == 'countries' ? true : false)
                }
        };  
        // draw / redraw map
        map.draw(dataViewAggr, mapOptions); 				
    }

    // Function to update the map based on the set of selected brands
    filterBrand = function(cb) {
        for (var i=0; i<brandsArray.length; i++) {
            if (brandsArray[i].brand == cb.value) {
                brandsArray[i].checked = cb.checked;
                break;
            }
        }
        redrawMap();
    }

    // Functions to change the map resolution display type with the corresponding change in data to aggregate by
    byRegion = function(){
        areaDisplayed = 0;
        resDisplayed = 'continents'
        redrawMap();
    }
    byMarket = function() {
        areaDisplayed = 1;
        resDisplayed = 'subcontinents'
        redrawMap();
    }
    byRepMarket = function() {
        areaDisplayed = 2;
        resDisplayed = 'countries'
        redrawMap();
    }

    // Functions to change the data column chosen to display in map
    showShip = function(){
        colDisplayed = 17;
        redrawMap();
    }
    showShipT = function(){
        colDisplayed = 30;
        redrawMap();
    }
    showShipLY = function(){
        colDisplayed = 43;
        redrawMap();
    }
    showSales = function(){
        colDisplayed = 56;
        redrawMap();
    }
    showSalesT = function(){
        colDisplayed = 69;
        redrawMap();
    }
    showSalesLY = function(){
        colDisplayed = 82;
        redrawMap();
    }

    // Function to change the map focus
    mapFocus = function(value){
        mapFoc = value;
        redrawMap();
    }

    function allColumns() {
        var columns = [];
        for (var k=0; k<=82; k++)
            columns.push(k);
        return columns;
    }

    function getMinValue(chartData) {
        //var a = chartData.getValue(0,1);
        //var b = chartData.getValue(0,2);
        var min = chartData.getValue(0,1);
        //var min = a;
//        if (b < min)
//            min = b;
//        return (min-Math.abs(a-b)/8);
        for (var k=0; k<12; k++) {
            if (chartData.getValue(k,1) < min)
                min = chartData.getValue(k,1);
            if (chartData.getValue(k,2) < min)
                min = chartData.getValue(k,2);
        }
    }

    // Callback function that handles clicks on the map regions
    function clickHandler(){
        var selection = map.getSelection();
        var region = dataViewAggr.getValue(selection[0].row, 0);
        var colArray = [];

        dataView.setRows(data.getFilteredRows([{
            column: 3, 
            test: function (value, row, column, table) {
                var res = false;
                for (var i=0; i<brandsArray.length; i++) {
                    if ((brandsArray[i].brand == value) &&
                        (brandsArray[i].checked) &&
                        (data.getValue(row, areaDisplayed) == region)) {
                        res = true;
                        break;
                    }
                }
                return (res);
            }
        }]));

        // Table drawing
        tableView = new google.visualization.DataView(dataView);
        tableView.setColumns([0,1,2,3,4,17,30,43,56,69,82]);
        table.draw(tableView, {frozenColumns: 5, showRowNumber: true, page: 'enable', pageSize: 20, pagingButtons: 'both'});

        // Chart 1 drawing
        for (var k=0; k<12; k++)
            colArray.push({'column': k+5, 'aggregation': google.visualization.data.sum, 'type': 'number'})
        for (var k=0; k<12; k++)
            colArray.push({'column': k+18, 'aggregation': google.visualization.data.sum, 'type': 'number'})

        chart1Data = google.visualization.data.group(dataView, [areaDisplayed], colArray);
        chartTable.setColumnLabel(1, 'Shipments');
        chartTable.setColumnLabel(2, 'Target Shipments');
        for (var k=0; k<12; k++) {
            chartTable.setValue(k, 1, chart1Data.getValue(0,k+1));
            chartTable.setValue(k, 2, chart1Data.getValue(0,k+13));
        }
        
        chart1.draw(chartTable, {title: 'Shipments vs Target', vAxis: {minValue: getMinValue(chartTable), format: '0.000E00'}, hAxis: {slantedText: true, slantedTextAngle: 50}, animation:{startup: true, duration: 1000, easing: 'out'}, legend: {position: 'none'}});

        // Chart 2 drawing
        for (var k=0; k<12; k++)
            colArray[k+12] = {'column': k+31, 'aggregation': google.visualization.data.sum, 'type': 'number'}
        
        chart2Data = google.visualization.data.group(dataView, [areaDisplayed], colArray);
        chartTable.setColumnLabel(2, 'Last Year Shipments');
        for (var k=0; k<12; k++)
            chartTable.setValue(k, 2, chart2Data.getValue(0,k+13));
        
        chart2.draw(chartTable, {title: 'Shipments vs Last Year\'s', vAxis: {minValue: getMinValue(chartTable), format: '0.000E00'}, hAxis: {slantedText: true, slantedTextAngle: 50}, animation:{startup: true, duration: 1000, easing: 'out'}, legend:{position: 'none'}});
        
        // Chart 3 drawing
        for (var k=0; k<12; k++) {
            colArray[k] = {'column': k+44, 'aggregation': google.visualization.data.sum, 'type': 'number'}
            colArray[k+12] = {'column': k+57, 'aggregation': google.visualization.data.sum, 'type': 'number'}
        }

        chart3Data = google.visualization.data.group(dataView, [areaDisplayed], colArray);
        chartTable.setColumnLabel(1, 'Sales');
        chartTable.setColumnLabel(2, 'Target Sales');
        for (var k=0; k<12; k++) {
            chartTable.setValue(k, 1, chart3Data.getValue(0,k+1));
            chartTable.setValue(k, 2, chart3Data.getValue(0,k+13));
        }
        
        chart3.draw(chartTable, {title: 'Sales vs Target', vAxis: {minValue: getMinValue(chartTable), format: '0.000E00'}, hAxis: {slantedText: true, slantedTextAngle: 50}, animation:{startup: true, duration: 1000, easing: 'out'}, legend:{position: 'none'}});
        
        // Chart 4 drawing
        for (var k=0; k<12; k++)
            colArray[k+12] = {'column': k+70, 'aggregation': google.visualization.data.sum, 'type': 'number'}

        chart4Data = google.visualization.data.group(dataView, [areaDisplayed], colArray);
        chartTable.setColumnLabel(2, 'Last Year Sales');
        for (var k=0; k<12; k++)
            chartTable.setValue(k, 2, chart4Data.getValue(0,k+13));
        
        chart4.draw(chartTable, {title: 'Sales vs Last Year\'s', vAxis: {minValue: getMinValue(chartTable), format: '0.000E00'}, hAxis: {slantedText: true, slantedTextAngle: 50}, animation:{startup: true, duration: 1000, easing: 'out'}, legend:{position: 'none'}});
    }
    // Add callback to click on map event
    google.visualization.events.addListener(map, 'select', clickHandler);
}