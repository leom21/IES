var chartModule = angular.module("chartModule", []);
chartModule.directive("lineChart", ["$rootScope", "$timeout", function ($rootScope, $timeout) {
        return {
            retrict: "E",
            replace: false,
            template: "<svg class='lineChart'></div>",
            scope: {data: '=data', type: '=type', kind: '=kind', moData: '=moData', pos: '=pos'},
            link: function (scope, element, attrs) {
                if (scope.type === "bell") {

                    var bellData = [
                        {
                            key: "Normal Distribution",
                            values: [{x: 96.00, y: -10}, {x: 98.00, y: -8}, {x: 100.00, y: -5}, {x: 102.00, y: 0}, {x: 104.00, y: 1}, {x: 106.00, y: 0}, {x: 108.00, y: -5}, {x: 110.00, y: -8}, {x: 112.00, y: -10}],
                            color: "#f2f2f2"
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
                        chart.height(347);
                        chart.yAxis.tickValues(function (d) {
                            var dataset = ["-10", "-6", "-2", "2", "6", "10"];
                            return dataset;
                        });
                        chart.y2Axis.tickValues(function (d) {
                            var y2d = ["0", "5", "10", "15", "20", "25"];
                            return y2d;
                        });
                        var svgE = element.find("svg")[0];
                        var w = $("#bell").width();
                        var h = $(svgE).height();
                        $(window).resize(function () {
                            w = $(svgE).width();
                            h = $(svgE).height();
                        });
                        chart.xAxis.tickFormat(function (d, i) {
                            return "";
                        });
                        function draw(data) {
                            d3.select(element.find("svg")[0])
                                    .datum(data)
                                    .transition().duration(1500).call(chart);
                            d3.select(".nv-legend")
                                    .attr("transform", "translate(-" + w / 2 + ",0)");
                            nv.utils.windowResize(function () {
                                chart.update();
                            });
                        }

                        draw(bellData);
                        $rootScope.$watch('curX', function (oldValue, newValue) {
                            if (oldValue !== undefined) {
                                $timeout(function () {
                                    var svgE = element.find("svg")[0];
                                    var w = $(svgE).width();
                                    var prc = (($rootScope.curX / 1000) * 61) / 100;
                                    var bPnt = $rootScope.curX * 100;

                                }, 1);
                            }
                        });
                    });
                } else {
                    nv.addGraph(function () {
                        var chart = nv.models.lineChart();
                        chart.useInteractiveGuideline(true)
                                .showYAxis(true)
                                .showXAxis(true)
                                .showLegend(true)
                                .tooltips(false)
                                .tooltipContent(function (key, y, e, graph) {
                                    return '<h3>' + key + '</h3>' +
                                            '<p>' + e.value.toSizeFmt() + '</p>';
                                })
                                .margin({top: 55, right: 55, bottom: 55, left: 60});
                        chart.height(347);
                        chart.interactiveLayer.tooltip.contentGenerator(function (data) {
                            return data.value + "<br/>" +
                                    data.series[0].key + ": " + data.series[0].value + "</div><br/>" +
                                    data.series[1].key + ": " + data.series[1].value + "</div><br/>";
                        });
                        chart.y2Axis.tickValues(function (d) {
                            var dataset = [];
                            return dataset;
                        });

                        chart.xAxis.tickFormat(function (d, i) {
                            return d + "$";
                        });

                        var svgE = element.find("svg")[0];
                        var w = $(svgE).width();
                        var h = $(svgE).height();
                        d3.select(element.find("svg")[0]).append("line")
                                .style("stroke", "#d2cfcb")
                                .attr("x1", w / 2 + 2.5)
                                .attr("y1", 37)
                                .attr("x2", w / 2 + 2.5)
                                .attr("y2", h - 48)
                                .attr("stroke-dasharray", "10,10");
                        $(window).resize(function () {
                            w = $(svgE).width();
                            h = $(svgE).height();
                        });

                        d3.select(element.find("svg")[0]).append("text")
                                .attr("x", w / 2)
                                .attr("y", h)
                                .style("text-anchor", "middle")
                                .text("Price");
                        d3.select(element.find("svg")[0]).append("text")
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(" + (w - 15) + ",150) rotate(90)")
                                .text("Probability");
                        d3.select(element.find("svg")[0]).append("text")
                                .style("text-anchor", "middle")
                                .attr("transform", "translate(20,150) rotate(-90)")
                                .text("Profit");

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
                                var last = $rootScope.stockLast;
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

                                var w = $(window).width();
                                var chartW = $(svgE).width();
                                var chartH = $(svgE).height();
                                var wStep = ((chartW + 55) / 5);
                                $(window).resize(function () {
                                    chartH = $(svgE).height() - 30;
                                    chartW = $(svgE).width();
                                });

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
                                var tmpH = (chartH) / 5;
                                var step = Math.round(245 / 5);
                                var hScale = {
                                    0: chartH - 44,
                                    1: (chartH - 44) - 58,
                                    2: (chartH - 44) - 130,
                                    3: (chartH - 44) - 198,
                                    4: (chartH - 44) - 261
                                };
                                d3.selectAll(".yValue").remove();
                                for (var i = 0; i < 5; i++) {

                                    d3.select(element.find("svg")[0]).append("text")
                                            .classed("yValue", true)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
//                                            .attr("transform", "translate(40," + parseInt(hScale[i] + 5) + ")")
                                            .attr("transform", "translate(42," + parseInt(hScale[i] + 3) + ")")
                                            .text(Math.round(pVol[i] * 100) + "%");
                                }

                                for (var i = 0; i < 6; i++) {
                                    d3.select(element.find("svg")[0]).append("text")
                                            .classed("yValue", true)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .attr("transform", "translate(" + parseInt(chartW - 37) + "," + parseInt(hScale[i] + 3) + ")")
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
                                        color: "#aecbc1"
                                    },
                                    {
                                        key: "Enhanced",
                                        values: eVals,
                                        color: "#856f8c",
                                        area: false
                                    }
                                ];
                                draw(linearData);

//Dynamic calculation.

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

                                var tickMarks = [
                                    (Math.floor(last * (1 - (2 * fS.PVol))) / 10) * 10,
                                    Math.floor(last * (1 - (fS.PVol))),
                                    last,
                                    Math.floor(last * (1 + (fS.PVol))),
                                    Math.floor(last * (1 + (2 * fS.PVol)))
                                ];

                                chart.xAxis
                                        .tickValues(tickMarks)
                                        .tickFormat(function (d) {
                                            return "$" + d;
                                        });
//                                    chart.forceX(120, 160);

                                chart.yAxis
                                        .tickFormat(d3.format(',f'));

                                d3.selectAll(".xValue").remove();
                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("text")
                                            .classed("xValue", true)
                                            .attr("x", 64 + (wStep * i))
                                            .attr("y", h - 27)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .style("fill", "black")
//                                            .text(xL[i] + "$");
                                            .text("");
                                }

//                                for (var i = 0; i < 5; i++) {
//                                    if (i == 1) {
//                                        wStep = wStep - 4;
//                                    } else if (i == 2) {
//                                        wStep = wStep + 4;
//                                    } else if (i == 3) {
//                                        wStep = wStep - 4;
//                                    } else if (i == 4) {
//                                        wStep = wStep + 4;
//                                    }
//                                    d3.select(element.find("svg")[0]).append("line")
//                                            .classed("lTick", true)
//                                            .style("stroke", "black")
//                                            .attr("x1", 62 + (wStep * i))
//                                            .attr("y1", h - 43)
//                                            .attr("x2", 62 + (wStep * i))
//                                            .attr("y2", h - 37);
//                                }

                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("line")
                                            .classed("lTick", true)
                                            .style("stroke", "black")
                                            .attr("x1", "55")
                                            .attr("y1", parseInt(hScale[i]))
                                            .attr("x2", "60")
                                            .attr("y2", parseInt(hScale[i]));
                                }

                                for (var i = 0; i < 5; i++) {
                                    d3.select(element.find("svg")[0]).append("line")
                                            .style("stroke", "black")
                                            .classed("lTick", true)
                                            .attr("x1", chartW - 50)
                                            .attr("y1", hScale[i])
                                            .attr("x2", chartW - 55)
                                            .attr("y2", hScale[i]);
                                }

                                w = w * 0.10;
                                $timeout(function () {
                                    var ua = window.navigator.userAgent;
                                    var msie = ua.indexOf("MSIE ");

                                    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                                        $(".takePosition").css("margin-top", "51px");
                                        var bPos = document.querySelectorAll('.nv-point-2')[1];
                                        var currentx = d3.transform(bPos.getAttribute("transform")).translate[0];
                                        var currenty = d3.transform(bPos.getAttribute("transform")).translate[1];
                                    } else {
                                        var bPos = $(".nv-series-1").find(".nv-point-2");
                                        var currentx = d3.transform(bPos.attr("transform")).translate[0];
                                        var currenty = d3.transform(bPos.attr("transform")).translate[1];
                                    }

                                    d3.select(".lTick").remove();
                                    d3.select(".redLine").remove();
                                    d3.select(".ep").remove();
                                    d3.select(".lp").remove();
                                    d3.select(".grad").remove();

                                    var tmp = chartW * fS.LossPercentage;
                                    $rootScope.curX = fS.LossPercentage;
                                    d3.select(element.find("svg")[0]).append("line")
                                            .classed("redLine", true)
                                            .style("stroke", "#fe1313")
                                            .attr("x1", currentx + 60)
                                            .attr("y1", currenty + 30)
                                            .attr("x2", currentx + 60)
                                            .attr("y2", h - 42)
                                            .transition()
                                            .duration(800)
                                            .attr("stroke-dasharray", "5,5");

                                    d3.select(element.find("svg")[0]).append("text")
                                            .classed("ep", true)
                                            .style("text-anchor", "start")
                                            .attr("transform", "translate(" + (currentx + 65) + "," + parseFloat(currenty + 36) + 100 + ") rotate(90)")
                                            .text("$" + (fS.Strike + premium).toFixed(2));


                                    d3.select(element.find("svg")[0]).append("linearGradient")
                                            .classed("grad", true)
                                            .attr("id", "temperature-gradient")
                                            .attr("gradientUnits", "userSpaceOnUse")
                                            .attr("x1", currentx - 1).attr("y1", 0)
                                            .attr("x2", chartW).attr("y2", 0)
                                            .selectAll("stop")
                                            .data([
                                                {offset: "0%", color: "#f2f2f2"},
                                                {offset: "0.4%", color: "#ffc2c2"},
                                                {offset: "0.8%", color: "#ffc2c2"},
                                                {offset: "1%", color: "#ff8e8e"},
                                                {offset: "19%", color: "#ff8e8e"},
                                                {offset: 100 - fS.LossPercentage * 100 + "%", color: "#ff8e8e"},
                                                {offset: "100%", color: "#ff8e8e"}
                                            ])
                                            .enter().append("stop")
                                            .attr("offset", function (d) {
                                                return d.offset;
                                            })
                                            .attr("stop-color", function (d) {
                                                return d.color;
                                            });
                                    d3.select(element.find("svg")[0]).append("text")
                                            .classed("lp", true)
                                            .attr("x", currentx + 85)
                                            .attr("y", (h / 4) * 3 + 30)
                                            .style("text-anchor", "middle")
                                            .style("font-size", "12px")
                                            .style("fill", "#fe1313")
                                            .text(parseFloat(fS.LossPercentage * 100).toFixed(2) + "%");
                                    draw(linearData);
                                }, 350);
                                nv.utils.windowResize(function () {
                                    chart.update();
                                });
                            }
                        });
                    });
                }
            }
        }
    }]);

chartModule.directive("historydChart", ["$rootScope", "$timeout", "$compile", function ($rootScope, $timeout, $compile) {
        return {retrict: "E", replace: false,
            template: "<svg class='lineChart'></div>",
            scope: {data: '=data', position: '=position'},
            link: function (scope, element, attrs) {
                scope.$watch("data", function (o, n) {
                    if (o !== undefined) {
                        angular.forEach(scope.position.positions, function (p) {
                            if (p.stock === $rootScope.stockData.Symbol) {
                                scope.osLast = p.stockLast;
                                scope.opLast = p.optionPrice;
                                scope.entry = p.entry;
                            }
                        });

                        var data = [
                            {key: "PnL",
                                values: [],
                                color: "#5d4750"
                            }
                        ];

                        angular.forEach(scope.data, function (d, i) {
                            var date = d.Date;
                            date = date.substring(0, date.length - 2);
                            date = date.substring(6, date.length);

//                                var entry = new Date(scope.entry);
//                                var fakeDay = (entry.setDate(entry.getDay()) + 24 + (1 * i));
//                                var fakeMonth = parseInt(entry.getMonth()) + 1;
//                                var fakeYear = entry.getFullYear();
//                                var x = new Date(fakeMonth + "/" + fakeDay + "/" + fakeYear).getTime();

                            var entry = new Date(scope.entry);
                            var day = entry.getDate();
                            var month = entry.getMonth();
                            var year = entry.getFullYear();
                            var time = month + 1 + "/" + parseInt(day) + "/" + year;

                            var fixedd = new Date(time);
                            var n = fixedd.setDate(fixedd.getDate() + (1 * i));

                            var pnl = ((((d.LastStockPrice - d.LastOptionPrice) + scope.opLast) / scope.osLast) - 1);

//                            data[0].values.push({x: n, y: pnl});
                                data[0].values.push({x: date, y: pnl});
                        });

//                        $timeout(function () {
                        nv.addGraph(function () {
                            var chart = nv.models.lineChart()
                                    .margin({left: 50, right: 35, bottom: 100})
                                    .useInteractiveGuideline(true)
                                    .showLegend(false)
                                    .showYAxis(true)
                                    .showXAxis(true)
                                    .x(function (d) {
                                        return d.x;
                                    });

                            chart.xAxis.tickValues(function (d) {
                                var dateSets = [];
                                for (var i = 0; i < d[0]['values'].length; i++) {
                                    dateSets.push(parseInt(d[0]['values'][i]['x']));
                                }
                                return dateSets;
                            });

                            chart.yAxis
                                    .tickFormat(function (d) {
                                        return d3.time.format(',.1%');
                                    });

                            chart.xAxis
                                    .showMaxMin(false)
                                    .tickFormat(function (d) {
                                        return d3.time.format('%x')(new Date(d));
                                    });

                            chart.xAxis.rotateLabels(-45);
                            var w = $(element.find("svg")[0]).width();
                            var h = $(element.find("svg")[0]).height();

//                                $(document).on("mousemove", element.find("svg")[0], function () {
                            $(element.find("svg")[0]).on("mousemove", function () {
                                d3.select(".yLine").remove();
                                d3.select(".prc").remove();

                                var lw = $(".nv-y2").offset().left;
                                var bPos = $(element.find("svg")[0]).find(".hover");
                                var leftOffset = $(bPos).offset().left;
                                var getEq = $(bPos).attr("class");
                                getEq = getEq.split("-")[3];
                                getEq = getEq.split(" ")[0];

                                var prc = ((data[0].values[getEq].y) * 100).toFixed(2);
                                var date = new Date(data[0].values[getEq].x);

                                var currentx = d3.transform(bPos.attr("transform")).translate[0];
                                var currenty = d3.transform(bPos.attr("transform")).translate[1];

                                if (lw == leftOffset || lw - leftOffset < 5) {
                                    currentx = currentx - 65;
                                }

                                d3.select(element.find("svg")[0]).append("line")
                                        .classed("yLine", true)
                                        .style("stroke", "#ccc")
                                        .attr("x1", "50")
                                        .attr("y1", currenty + 30)
                                        .attr("x2", "602")
                                        .attr("y2", currenty + 30)
                                        .transition()
                                        .duration(800)
                                        .attr("stroke-dasharray", "0,0");

                                d3.select(element.find("svg")[0]).append("text")
                                        .classed("prc", true)
                                        .attr("x", currentx + 80)
                                        .attr("y", currenty + 25)
                                        .style("text-anchor", "middle")
                                        .text(prc + "%");
                            });

//                                });

                            chart.yAxis
                                    .tickValues(function (d) {
                                        return d;
                                    })
                                    .tickFormat(d3.format(',.1%'));
                            chart.y2Axis
                                    .tickFormat(d3.format(',.1%'));

                            d3.select(element.find("svg")[0]).append("text")
                                    .attr("x", w / 2)
                                    .attr("y", h - 10)
                                    .style("text-anchor", "middle")
                                    .text("Date");
                            function draw(data) {
                                d3.select(element.find("svg")[0])
                                        .datum(data)
                                        .call(chart);
                                nv.utils.windowResize(function () {
                                    chart.update();
                                });
                                return chart;
                            }
                            draw(data);
                        });
//                        }, 300);
                    }
                });
                $compile(element.find("svg")[0])(scope);
            }
        };
    }]);
