var chartModule = angular.module("chartModule", []);
chartModule.directive("lineChart", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
        return {
            retrict: "E",
            replace: false,
            template: "<svg class='lineChart'></div>",
            scope: {data: '=data', type: '=type', kind: '=kind', moData: '=moData', pos: '=pos'},
            link: function (scope, element, attrs) {
                if (scope.type === "bell") {
//                    var lineData = scope.data;

                    console.log(scope);
                    var bellData = [
                        {
                            key: "Normal Distribution",
                            values: [{x: 96.00, y: -10}, {x: 98.00, y: -8}, {x: 100.00, y: -5}, {x: 102.00, y: 0}, {x: 104.00, y: 1}, {x: 106.00, y: 0}, {x: 108.00, y: -5}, {x: 110.00, y: -8}, {x: 112.00, y: -10}],
                            color: "rgb(233,216,187)"
                        }
                    ];
                    nv.addGraph(function () {
                        var chart = nv.models.lineChart();
                        chart.useInteractiveGuideline(false)
                                .showYAxis(false)
                                .showXAxis(false)
                                .tooltips(true)
                                .showLegend(true)
                                .margin({top: 55, right: 55, bottom: 55, left: 60});
                        chart.interpolate("basis");
                        chart.yAxis.tickValues(function (d) {
                            var dataset = ["-10", "-6", "-2", "2", "6", "10"];
                            return dataset;
                        });
                        chart.y2Axis.tickValues(function (d) {
                            var y2d = ["0", "5", "10", "15", "20", "25"];
                            return y2d;
                        });
                        var svgE = element.find("svg")[0];
                        var w = $(svgE).width();
                        var h = $(svgE).height();
                        $(window).resize(function () {
                            w = $(svgE).width();
                            h = $(svgE).height();
//                            d3.select(".nv-legend")
//                                    .attr("transform", "translate(-" + (120) + ",5)");
                        });
                        chart.xAxis.tickFormat(function (d, i) {
                            return "";
                        });
                        function draw(data) {
                            d3.select(element.find("svg")[0])
                                    .datum(data)
                                    .transition().duration(1500).call(chart);
                            d3.select(".nv-legend")
                                    .attr("transform", "translate(-" + (350) + ",0)");
//                            nv.utils.windowResize(chart.update);
                        }
                        draw(bellData);
//                   draw(lineData);
                        $rootScope.$watch('curX', function (oldValue, newValue) {
                            if (oldValue !== undefined) {
                                $timeout(function () {
                                    var svgE = element.find("svg")[0];
                                    var w = $(svgE).width();
                                    var prc = (($rootScope.curX / 1000) * 61) / 100;
                                    var bPnt = $rootScope.curX * 100;
                                    console.log(($rootScope.tryX / 573) * 100);
//
//                                    d3.select(element.find("svg")[0]).append("line")
//                                            .classed("redLine", true)
//                                            .style("stroke", "rgba(255,0,0,0.3)")
////                                            .attr("x1", currentx + 59 + premium * 10)
////                                            .attr("x1", 458 - (fS.LossPercentage * 458 - 19.8))
//                                            .attr("x1", 88 - parseFloat(bPnt) - 2 + "%")
//                                            .attr("y1", "25")
//                                            .attr("x2", 88 - parseFloat(bPnt) - 2 + "%")
//                                            .attr("y2", h - 55)
//                                            .attr("stroke-dasharray", "5,0");
//                                    d3.select(".grad").remove();
//                                    d3.select(element.find("svg")[0]).append("linearGradient")
//                                            .classed("grad", true)
//                                            .attr("id", "temperature-gradient")
//                                            .attr("gradientUnits", "userSpaceOnUse")
//                                            .attr("x1", 0).attr("y1", 0)
//                                            .attr("x2", 458).attr("y2", 0)
//                                            .selectAll("stop")
//                                            .data([
//                                                {offset: "0%", color: "rgba(209,187,151,0.2)"},
//                                                {offset: ($rootScope.tryX / 573) * 100 + "%", color: "rgba(209,187,151,0.6)"},
//                                                {offset: ($rootScope.tryX / 573) * 100 + "%", color: "rgba(255,0,0,1)"},
//                                                {offset: ($rootScope.tryX / 573) * 100 + 0.1 + "%", color: "rgba(255,0,0,.9)"},
//                                                {offset: "105%", color: "rgba(255,0,0,.6)"}
//                                            ])
//                                            .enter().append("stop")
//                                            .attr("offset", function (d) {
//                                                return d.offset;
//                                            })
//                                            .attr("stop-color", function (d) {
//                                                return d.color;
//                                            });
                                }, 1);
                            }
                        });
                    });
                } else {
//                    var lineData = scope.data;
                    nv.addGraph(function () {
                        var chart = nv.models.lineChart();
                        chart.useInteractiveGuideline(true)
                                .showYAxis(true)
                                .showLegend(true)
                                .tooltips(false)
                                .tooltipContent(function (key, y, e, graph) {
                                    return '<h3>' + key + '</h3>' +
                                            '<p>' + e.value.toSizeFmt() + '</p>';
                                })
                                .margin({top: 55, right: 55, bottom: 55, left: 60});
                        chart.interactiveLayer.tooltip.contentGenerator(function (data) {
                            return data.value + "<br/>" +
                                    data.series[0].key + ": " + data.series[0].value + "</div><br/>" +
                                    data.series[1].key + ": " + data.series[1].value + "</div><br/>";
                        });
                        chart.y2Axis.tickValues(function (d) {
                            var dataset = [];
                            return dataset;
                        });
//                        chart.yAxis
//                                .tickFormat(function (d, i) {
//                                    return d;
//                                });
                        chart.xAxis.tickFormat(function (d, i) {
                            return d + "$";
                        });
                        var svgE = element.find("svg")[0];
                        var w = $(svgE).width();
                        var h = $(svgE).height();
                        d3.select(element.find("svg")[0]).append("line")
                                .style("stroke", "rgba(0,0,0,0.3)")
                                .attr("x1", w / 2 + 2.5)
                                .attr("y1", 37)
                                .attr("x2", w / 2 + 2.5)
                                .attr("y2", h - 55)
                                .attr("stroke-dasharray", "10,10");
                        $(window).resize(function () {
                            w = $(svgE).width();
                            h = $(svgE).height();
                        });
//                        d3.select(".nv-legendWrap")
//                                .attr("transform", "translate(200,100)");
                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                .attr("x", w / 2)
                                .attr("y", h - 10)
                                .style("text-anchor", "middle")
                                .text("Price");
                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(" + (w - 20) + ",150) rotate(90)")
                                .text("Probability");
                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(20,150) rotate(-90)")
                                .text("Profit");
//
//                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
//                                .style("text-anchor", "left")
//                                .style("font-size", "12px")
//                                .attr("transform", "translate(520,245)")
//                                .text("0");
//                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
//                                .style("text-anchor", "left")
//                                .style("font-size", "12px")
//                                .attr("transform", "translate(520,200)")
//                                .text("5%");
//                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
//                                .style("text-anchor", "left")
//                                .style("font-size", "12px")
//                                .attr("transform", "translate(520,145)")
//                                .text("10%");
//                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
//                                .style("text-anchor", "left")
//                                .style("font-size", "12px")
//                                .attr("transform", "translate(520,95)")
//                                .text("15%");
//                        d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
//                                .style("text-anchor", "left")
//                                .style("font-size", "12px")
//                                .attr("transform", "translate(520,40)")
//                                .text("20%");
//
//


                        function draw(data) {
                            d3.select(element.find("svg")[0])
                                    .datum(data)
                                    .transition().duration(1500).call(chart);
                            d3.select(".nv-legend")
                                    .attr("transform", "translate(" + (47) + ",0)");
//                            nv.utils.windowResize(chart.update);
                        }

                        scope.$watch('data', function (newValue, oldValue) {
                            if (oldValue !== newValue) {
                                var last = $rootScope.moData.last;
                                var tgtPrc = $rootScope.moData.tgtPrc;
                                var fS = scope.data;
                                var xs = [];
                                var ys = [];
                                var ysR = [];
                                var eVals = [];
                                var rVals = [];
                                var premium = (fS.Ask + fS.Bid) / 2;
                                var profitPoint = (fS.Bid * 100) / premium;
                                profitPoint = profitPoint.toFixed(2);
                                var lost = premium / fS.Strike;
                                var en = parseFloat(profitPoint) + parseFloat((profitPoint * 0.004));
                                var re = parseFloat(en) + parseFloat((en * 0.004));
                                var mid = ((fS.Bid + fS.Ask) / 2);
                                var brk = fS.Strike + mid;
                                xs.push(Math.round(last * (1 - (2 * fS.PVol))),
                                        fS.Strike,
                                        fS.Strike + premium,
                                        Math.round(last * (1 + (2 * fS.PVol))));
                                xs.sort(function (a, b) {
                                    if (a > b) {
                                        return 1;
                                    }
                                }
                                );
                                var strikePct = (last * 10) / 100;
                                var strikePct1 = Math.round(last * (1 - (2 * fS.PVol)));
                                for (var i = 0; i < xs.length; i++) {
                                    if (xs[i] < fS.Strike) {
                                        var x = (((xs[i] + premium) / last) - 1) * 100;
                                        ys.push(x);
                                    } else if (xs[i] == fS.Strike || xs[i] > fS.Strike) {
                                        var strike = (((fS.Strike + premium) / last) - 1) * 100;
                                        ys.push(strike);
                                    }
                                }

                                ys.sort(function (a, b) {
                                    if (a > b) {
                                        return 1;
                                    }
                                });
                                var x = xs[1] - xs[0];
                                var y = ys[1] - ys[0];
                                var gap = xs[2] - xs[1];
                                for (var i = 0; i < xs.length; i++) {
                                    var y = (xs[i] / last - 1) * 100;
                                    ysR.push(y);
                                }

                                var minmax = [];
                                for (var i = 0; i < ysR.length; i++) {
                                    var y = ys[i] / ysR[i];
//                                    var t = y * 100;
                                    minmax.push(y);
                                }

                                for (var i = 0; i < xs.length; i++) {
                                    eVals.push({x: xs[i], y: ys[i] / 100});
                                }

                                for (var i = 0; i < xs.length; i++) {
                                    rVals.push({x: xs[i], y: ysR[i] / 100});
                                }
                                var pVol = {
                                    0: -((fS.PVol) * 2),
                                    1: -((fS.PVol)),
                                    2: 0,
                                    3: ((fS.PVol)),
                                    4: ((fS.PVol) * 2)
                                };
                                var tmpH = 215;
                                var step = Math.round(245 / 5);
                                var hScale = {
                                    0: 245,
                                    1: 191,
                                    2: 137,
                                    3: 82,
                                    4: 29
                                };
                                d3.selectAll(".yValue").remove();
                                for (var i = 0; i < 6; i++) {

                                    d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                            .classed("yValue", true)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .attr("transform", "translate(40," + +parseInt(hScale[i] + 5) + ")")
                                            .text(Math.round(pVol[i] * 100) + "%");
                                }
                                for (var i = 0; i < 6; i++) {
                                    d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                            .classed("yValue", true)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .attr("transform", "translate(538," + +parseInt(hScale[i] + 3) + ")")
                                            .text(i * 5 + "%");
                                }
                                chart.yAxis
                                        .tickFormat(function (d) {
////                                            return (d * 100);
                                        });
                                var linearData = [
                                    {
                                        key: "Regular",
                                        values: rVals,
                                        color: "#94A59F"
                                    },
                                    {
                                        key: "Enhanced",
                                        values: eVals,
                                        color: "#7A777B",
                                        area: false
                                    }
                                ];
                                draw(linearData);
                                var w = $(window).width();
                                var chartW = $(svgE).width();
                                var chartW = $(svgE).width();
                                var wStep = (570 / 5) + 0.4;
                                $(window).resize(function () {
                                    chartH = $(svgE).height();
                                    chartH = $(svgE).height();
                                });
                                var xL = [];
                                if (last > 120) {
                                    if (Math.floor((last * (1 + (fS.PVol))) / 10) * 10 < fS.Strike) {
                                        var postLast = (Math.floor((last * (1 + (fS.PVol))) / 10) * 10) + 10;
                                    } else {
                                        var postLast = Math.floor((last * (1 + (fS.PVol))) / 10) * 10;
                                    }
                                    xL.push(
                                            Math.floor((last * (1 - (2 * fS.PVol))) / 10) * 10,
                                            Math.floor((last * (1 - (fS.PVol))) / 10) * 10,
                                            last,
                                            postLast,
                                            Math.floor((last * (1 + (2 * fS.PVol))) / 10) * 10
                                            );
                                } else if (last < 120 || last > 50) {
                                    xL.push(
                                            Math.floor(last * (1 - (2 * fS.PVol))),
                                            Math.floor(last * (1 - (fS.PVol))),
                                            last,
                                            Math.floor(last * (1 + (fS.PVol))),
                                            Math.floor(last * (1 + (2 * fS.PVol)))
                                            );
                                } else if (last < 50) {
                                    xL.push(
                                            Math.floor(last * (1 - (2 * fS.PVol)) / 2),
                                            Math.floor(last * (1 - (fS.PVol)) / 2),
                                            last,
                                            Math.floor(last * (1 + (fS.PVol)) / 2),
                                            Math.floor(last * (1 + (2 * fS.PVol)) / 2)
                                            );
                                }

                                d3.selectAll(".xValue").remove();
                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                            .classed("xValue", true)
                                            .attr("x", 64 + (wStep * i))
                                            .attr("y", h - 40)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .style("fill", "black")
                                            .text(xL[i] + "$");
                                }

                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("line")
                                            .classed("lTick", true)
                                            .style("stroke", "black")
                                            .attr("x1", 61 + (wStep * i))
                                            .attr("y1", h - 55)
                                            .attr("x2", 61 + (wStep * i))
                                            .attr("y2", h - 50);
                                }

                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("line")
                                            .classed("lTick", true)
                                            .style("stroke", "black")
                                            .attr("x1", "55")
                                            .attr("y1", hScale[i])
                                            .attr("x2", "60")
                                            .attr("y2", hScale[i]);
                                }

                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("line")
                                            .style("stroke", "black")
                                            .classed("lTick", true)
                                            .attr("x1", "523")
                                            .attr("y1", hScale[i])
                                            .attr("x2", "518")
                                            .attr("y2", hScale[i]);
                                }

                                w = w * 0.10;
                                $timeout(function () {
                                    d3.select(".redLine").remove();
                                    d3.select(".lp").remove();
                                    d3.select(".grad").remove();
                                    var bPos = $(".nv-series-1").find(".nv-point-2");
//                                    var tr2 = tr.attr("transform").translate[0];
//                                    var g = parseInt(tr2.replace("translate(", ""));
                                    var currentx = d3.transform(bPos.attr("transform")).translate[0];
                                    var currenty = d3.transform(bPos.attr("transform")).translate[1];
                                    var tmp = chartW * fS.LossPercentage;
//                                    $rootScope.curX = currentx + 59 + premium * 10;
                                    $rootScope.curX = fS.LossPercentage;
                                    d3.select(element.find("svg")[0]).append("line")
                                            .classed("redLine", true)
                                            .style("stroke", "rgba(255,0,0,0.8)")
                                            .attr("x1", currentx + 60)
                                            .attr("y1", currenty + 30)
                                            .attr("x2", currentx + 60)
                                            .attr("y2", h - 56)
                                            .transition()
                                            .duration(800)
                                            .style("stroke", "rgba(255,0,0,0.9)")
                                            .attr("stroke-dasharray", "5,5");
                                    d3.select(element.find("svg")[0]).append("linearGradient")
                                            .classed("grad", true)
                                            .attr("id", "temperature-gradient")
                                            .attr("gradientUnits", "userSpaceOnUse")
                                            .attr("x1", currentx - 1).attr("y1", 0)
                                            .attr("x2", chartW).attr("y2", 0)
                                            .selectAll("stop")
                                            .data([
                                                {offset: "0%", color: "rgba(209,187,151,0.3)"},
//                                                {offset: "50%", color: "rgba(209,187,151,0.6)"},
//                                                {offset: 90 - Math.round(fS.LossPercentage * 100) + "%", color: "rgba(255,0,0,1)"},
                                                {offset: "0.4%", color: "rgba(255,0,0,1)"},
                                                {offset: "0.8%", color: "rgba(255,0,0,1)"},
                                                {offset: "1%", color: "rgba(255,0,0,0.7)"},
                                                {offset: "19%", color: "rgba(255,0,0,.7)"},
                                                {offset: 100 - fS.LossPercentage * 100 + "%", color: "rgba(255,0,0,.7)"},
                                                {offset: "100%", color: "rgba(255,0,0,.6)"}
                                            ])
                                            .enter().append("stop")
                                            .attr("offset", function (d) {
                                                return d.offset;
                                            })
                                            .attr("stop-color", function (d) {
                                                return d.color;
                                            });
                                    console.log(currentx + 80 + premium * 10);
                                    d3.select(element.find("svg")[0]).append("text")      // text label for the x axis
                                            .classed("lp", true)
                                            .attr("x", currentx + 80)
                                            .attr("y", (h / 4) * 3 + 16)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .style("fill", "rgba(245,20,20,1)")
                                            .text(fS.LossPercentage * 100 + "%");
                                }, 300);
                                draw(linearData);
                            }
                        });
                        //                    });
                    });
                }
            }
        }
        ;
    }]);
chartModule.directive("historydChart", ["$rootScope", function ($rootScope) {
        return {retrict: "E", replace: false,
            template: "<svg class='lineChart'></div>",
            scope: {data: '=data'},
            link: function (scope, element, attrs) {
                var finalData = [];
                var tDa = [];
                var bDa = [];
                var aaa = [];
                angular.forEach(scope.data[0].values, function (v) {
                    aaa.push(v[1]);
                });
                var x = parseInt(d3.deviation(aaa));
                angular.forEach(scope.data[0].values, function (v) {
                    var tD = v[1] + (v[1] * 0.05);
                    var bD = v[1] - (v[1] * 0.05);
                    tDa.push([v[0], tD]);
                    bDa.push([v[0], bD]);
                });
                var kT = {
                    key: "Possitive StD",
                    values: tDa,
                    color: "#0f0"
                };
                var kB = {
                    key: "Negative StD",
                    values: bDa,
                    color: "#f00"
                };
                finalData.push(kB);
                finalData.push(scope.data[0]);
                finalData.push(kT);
                $(".nvtooltip").hide();
                nv.addGraph(function () {
                    var chart = nv.models.cumulativeLineChart()
                            .x(function (d) {
                                return d[0]
                            })
                            .y(function (d) {
                                return d[1]
                            }) //adjusting, 100% is 1.00, not 100 as it is in the data
                            .showYAxis(false)
                            .showLegend(true)
                            .useInteractiveGuideline(false);
                    chart.xAxis
                            .tickValues([1078030800000, 1122782400000, 1167541200000, 1251691200000])
                            .tickFormat(function (d) {
                                return d3.time.format('%x')(new Date(d));
                            });
                    function draw(data) {
                        d3.select(element.find("svg")[0])
                                .datum(data)
                                .transition().duration(1500).call(chart);
                        $rootScope.$watch("curX", function (oldValue) {
                            if (oldValue !== undefined) {
                                var bPnt = $rootScope.curX * 100 / 1000;
                                d3.select(".hisgradT").remove();
                                d3.select(".hisgradB").remove();
                                d3.select(".hisgradM").remove();
                                d3.select(element.find("svg")[0]).append("linearGradient")
                                        .classed("hisgradT", true)
                                        .attr("id", "historicalT")
                                        .attr("gradientUnits", "userSpaceOnUse")
                                        .attr("x1", 0).attr("y1", 0)
                                        .attr("x2", 500).attr("y2", 0)
                                        .selectAll("stop")
                                        .data([
                                            {offset: "0", color: "rgba(0,255,0,0.0)"},
                                            {offset: "0.5", color: "rgba(0,255,0,0.1)"},
                                            {offset: "0.5", color: "rgba(0,255,0,0.2)"},
                                            {offset: "1", color: "rgba(0,255,0,0.4)"}
                                        ])
                                        .enter().append("stop")
                                        .attr("offset", function (d) {
                                            return d.offset;
                                        })
                                        .attr("stop-color", function (d) {
                                            return d.color;
                                        });
                                d3.select(element.find("svg")[0]).append("linearGradient")
                                        .classed("hisgradM", true)
                                        .attr("id", "historicalM")
                                        .attr("gradientUnits", "userSpaceOnUse")
                                        .attr("x1", 0).attr("y1", 0)
                                        .attr("x2", 500).attr("y2", 0)
                                        .selectAll("stop")
                                        .data([
                                            {offset: "0", color: "rgba(112,119,123,0.5)"},
                                            {offset: bPnt * 2, color: "rgba(112,119,123,0.5)"},
                                            {offset: bPnt * 2, color: "rgba(112,119,123,0.9)"},
                                            {offset: "1", color: "rgba(112,119,123,0.9)"}
                                        ])
                                        .enter().append("stop")
                                        .attr("offset", function (d) {
                                            return d.offset;
                                        })
                                        .attr("stop-color", function (d) {
                                            return d.color;
                                        });
                                d3.select(element.find("svg")[0]).append("linearGradient")
                                        .classed("hisgradB", true)
                                        .attr("id", "historicalB")
                                        .attr("gradientUnits", "userSpaceOnUse")
                                        .attr("x1", 0).attr("y1", 0)
                                        .attr("x2", 500).attr("y2", 0)
                                        .selectAll("stop")
                                        .data([
                                            {offset: "0", color: "rgba(255,0,0,0.0)"},
                                            {offset: bPnt * 2, color: "rgba(255,0,0,0.1)"},
                                            {offset: bPnt * 2, color: "rgba(255,0,0,0.2)"},
                                            {offset: "1", color: "rgba(255,0,0,0.6)"}
                                        ])
                                        .enter().append("stop")
                                        .attr("offset", function (d) {
                                            return d.offset;
                                        })
                                        .attr("stop-color", function (d) {
                                            return d.color;
                                        });
                            }
                        });
                    }

                    draw(finalData);
                    nv.utils.windowResize(chart.update);
                    scope.$watch('data', function (newValue, oldValue) {
                        draw(finalData);
                    });
                });
            }
        };
    }]);
