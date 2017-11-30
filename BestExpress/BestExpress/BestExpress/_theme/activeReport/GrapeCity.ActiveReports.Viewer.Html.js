!function(window) {
    function ActionItemsResolver() {
        function isArDrillthroughLink(link) {
            return null === link || void 0 === link ? !1 : link.match("javascript") && link.match(".goToReport");
        }
        function getElementData(element, attributeName) {
            var data = element.attr(attributeName);
            return null === data || void 0 === data || 0 === data.length ? null : decodeURI(data);
        }
        function resolveBookmarkInfo(data) {
            function extractByKey(array, key, separator) {
                for (var i = 0; i < array.length; i++) {
                    var elem = array[i], preffix = elem.substring(0, key.length);
                    if (preffix.toUpperCase() === key.toUpperCase()) return elem.substring(key.length + separator.length, elem.length);
                }
                return null;
            }
            if (null === data || void 0 === data) return null;
            var bookmarkInfo = data.split(","), pageNumberValue = extractByKey(bookmarkInfo, "PageNumber", "=");
            if (null === pageNumberValue) return null;
            pageNumberValue = parseInt(pageNumberValue, 10);
            var targetValue = extractByKey(bookmarkInfo, "Target", "=");
            return null === targetValue ? null : {
                PageNumber: pageNumberValue,
                Target: targetValue
            };
        }
        function resolveToggleInfo(data) {
            var parsedData;
            try {
                parsedData = $.parseJSON(data);
            } catch (ex) {
                return null;
            }
            return null === parsedData || void 0 === parsedData ? null : parsedData;
        }
        function resolvePageReportElementAction(element) {
            var dataValue = htmlDecode(getElementData(element, "data")), hrefValue = htmlDecode(getElementData(element, "href"));
            if (null === dataValue && null === hrefValue) return null;
            var bookmarkInfo = resolveBookmarkInfo(dataValue);
            if (null === bookmarkInfo && (bookmarkInfo = resolveBookmarkInfo(hrefValue)), null !== bookmarkInfo) return {
                actionType: ActionType.bookmark,
                reportType: ReportType.pageReport,
                element: element,
                pageNumber: bookmarkInfo.PageNumber,
                target: bookmarkInfo.Target
            };
            if (element.is("[class$=toggle]")) {
                var toggleInfo = resolveToggleInfo(dataValue);
                if (null !== toggleInfo) return {
                    actionType: ActionType.toggle,
                    reportType: ReportType.pageReport,
                    element: element,
                    toggleInfo: toggleInfo
                };
            }
            var drillthroughInfo = null !== dataValue ? dataValue : null !== hrefValue ? hrefValue : null;
            if (element.is("[class$=drillthrough]") || isArDrillthroughLink(drillthroughInfo)) return {
                actionType: ActionType.drillthrough,
                reportType: ReportType.pageReport,
                element: element,
                drillthroughLink: drillthroughInfo
            };
            var hyperlinkUrl = null !== dataValue ? dataValue : null !== hrefValue ? hrefValue : null;
            return null !== hyperlinkUrl ? {
                actionType: ActionType.hyperlink,
                reportType: ReportType.pageReport,
                element: element,
                url: hyperlinkUrl
            } : null;
        }
        function htmlDecode(value) {
            return value ? $("<div />").html(value).text() : null;
        }
        function resolveFromPageReportContent(content) {
            return $(content).find("a").map(function(index, item) {
                return resolvePageReportElementAction($(item));
            }).filter(function(item) {
                return null !== item;
            }).get().concat($(content).find("map > area").map(function(index, item) {
                return resolvePageReportElementAction($(item));
            }).filter(function(item) {
                return null !== item;
            }).get()).concat($(content).find("span").map(function(index, item) {
                return resolvePageReportElementAction($(item));
            }).filter(function(item) {
                return null !== item;
            }).get());
        }
        function resolveFromSectionReportContent(content) {
            return $(content).find("a").map(function(index, item) {
                var element = $(item), url = getElementData(element, "href");
                if (null === url) return !0;
                var sectionBookmarkLabel = /^toc?:\/\/(.*)/i.exec(url);
                return null !== sectionBookmarkLabel ? {
                    actionType: ActionType.bookmark,
                    reportType: ReportType.sectionReport,
                    element: element,
                    label: sectionBookmarkLabel[1]
                } : {
                    actionType: ActionType.hyperlink,
                    reportType: ReportType.sectionReport,
                    element: element,
                    url: url
                };
            }).filter(function(item) {
                return null !== item;
            }).get();
        }
        function resolve(content, reportType) {
            switch (reportType) {
              case ReportType.pageReport:
                return resolveFromPageReportContent(content);

              case ReportType.sectionReport:
                return resolveFromSectionReportContent(content);

              default:
                return [];
            }
        }
        var resolver = {
            resolve: resolve
        };
        return resolver;
    }
    function parseParameterValue(value, type) {
        if (null === value) return null;
        if (type == ServiceParameterType.DateTime) {
            var millis = (+value - ticksOffsetFromUnixEpoch) / ticksInMillisecond, millisUtc = millis + new Date(millis).getTimezoneOffset() * millisecondsInMinute;
            return new Date(millisUtc);
        }
        return value;
    }
    function ar_convertServiceParameters(parameters) {
        function convertValues(values, type) {
            return (values || []).map(function(v) {
                return {
                    label: v.Label,
                    value: parseParameterValue(v.Value, type)
                };
            });
        }
        function resolveEditor(p) {
            return p.MultiLine && p.ParameterType == ServiceParameterType.String ? ParameterEditorType.MultiLine : p.AvailableValues && p.AvailableValues.length > 0 ? p.MultiValue ? ParameterEditorType.MultiValue : ParameterEditorType.SelectOneFromMany : ParameterEditorType.SingleValue;
        }
        var ServiceParameterState = {
            Ok: 0,
            ExpectValue: 1,
            HasOutstandingDependencies: 2,
            ValidationFailed: 3,
            DynamicValuesUnavailable: 4
        };
        return parameters.map(function(p) {
            return {
                name: p.Name,
                value: parseParameterValue(p.Value, p.ParameterType),
                values: convertValues(p.Values, p.ParameterType),
                availableValues: convertValues(p.AvailableValues, p.ParameterType),
                prompt: p.Prompt || p.Name,
                nullable: !!p.Nullable,
                multiline: !!p.MultiLine,
                multivalue: !!p.MultiValue,
                allowEmpty: !!p.AllowEmpty,
                dateOnly: !!p.DateOnly,
                type: function(value) {
                    switch (value) {
                      case ServiceParameterType.DateTime:
                        return ParameterType.DateTime;

                      case ServiceParameterType.Bool:
                        return ParameterType.Bool;

                      case ServiceParameterType.Int:
                        return ParameterType.Int;

                      case ServiceParameterType.Float:
                        return ParameterType.Float;

                      default:
                        return ParameterType.String;
                    }
                }(p.ParameterType),
                state: function(value) {
                    switch (value) {
                      case ServiceParameterState.ExpectValue:
                        return ParameterState.ExpectValue;

                      case ServiceParameterState.HasOutstandingDependencies:
                        return ParameterState.HasOutstandingDependencies;

                      case ServiceParameterState.ValidationFailed:
                        return ParameterState.ValidationFailed;

                      case ServiceParameterState.DynamicValuesUnavailable:
                        return ParameterState.DynamicValuesUnavailable;

                      default:
                        return ParameterState.Ok;
                    }
                }(p.State),
                error: p.ExtendedErrorInfo || "",
                editor: resolveEditor(p),
                dependantParameterNames: (p.DependantParameters || []).map(function(dependant) {
                    return dependant.Name;
                })
            };
        });
    }
    function ar_convertClientParameters(parameters) {
        return parameters.map(ar_convertClientParameter);
    }
    function ar_convertClientParameter(p) {
        function serialize(value, type) {
            if (value && value.getMonth) {
                var millisLocal = value.getTime() - value.getTimezoneOffset() * millisecondsInMinute;
                return millisLocal * ticksInMillisecond + ticksOffsetFromUnixEpoch;
            }
            return value;
        }
        function convertValues(values) {
            return (values || []).map(function(v) {
                return {
                    Label: v.label || "",
                    Value: serialize(v.hasOwnProperty("value") ? v.value : v)
                };
            });
        }
        return p.multivalue ? {
            MultiValue: !0,
            Name: p.name,
            Values: convertValues(p.values)
        } : {
            Name: p.name,
            Value: serialize(p.value)
        };
    }
    function ArReportService(options, resourceManager) {
        function isUndefined(value) {
            return void 0 === value || null === value;
        }
        function productVersion() {
            return "10.1.7703.0";
        }
        function open(reportId, parameters) {
            return $base.post("OpenReport", {
                version: 4,
                culture: "en_US",
                reportPath: reportId,
                acceptedFormats: [ formats.Html ],
                lifeTime: 600
            }).then(function(d) {
                if (isUndefined(d.Token)) return $base.invalidResponse(d);
                if (d.ProductVersion > productVersion()) return $base.errorPromise(SR("error.JsVersionsMismatch"));
                var reportInfo = {
                    token: d.Token,
                    parameters: ar_convertServiceParameters(d.ParameterCollection || []),
                    reportType: getReportType(d.DocumentFormat),
                    autoRun: d.AutoRun
                };
                if (parameters && parameters.length) {
                    var def = $.Deferred();
                    return parameters = mergeParameters(reportInfo.parameters, parameters), validateParameters(reportInfo.token, parameters).done(function(params) {
                        def.resolve($.extend(reportInfo, {
                            parameters: params
                        }));
                    }).fail(function() {
                        def.resolve(reportInfo);
                    }), def.promise();
                }
                return reportInfo;
            });
        }
        function openDrillthroughReport(token, reportId) {
            return $base.post("OpenDrillthroughReport", {
                token: token,
                reportPath: reportId,
                lifeTime: 3600
            }).then(function(d) {
                return isUndefined(d.Token) ? $base.invalidResponse(d) : {
                    token: d.Token,
                    parameters: ar_convertServiceParameters(d.ParameterCollection || []),
                    reportType: getReportType(reportId),
                    autoRun: d.AutoRun
                };
            });
        }
        function ping(reportToken) {
            return $base.post("GetStatus", {
                token: reportToken
            }).then(function(d) {
                var state = d.LoadState;
                if (isUndefined(state) || isUndefined(d.AvailablePages)) return $base.promise(!1);
                switch (state) {
                  case loadStates.Error:
                  case loadStates.Cancelled:
                  case loadStates.Cancelling:
                    return $base.promise(!1);
                }
                return $base.promise(!0);
            });
        }
        function getReportType(docFormat) {
            if (null === docFormat || void 0 === docFormat) return ReportType.unknown;
            switch (docFormat) {
              case documentFormat.rpx:
              case documentFormat.rdf:
                return ReportType.sectionReport;

              case documentFormat.rdlx:
                return ReportType.pageReport;

              default:
                return ReportType.unknown;
            }
        }
        function close(reportToken, async) {
            return $base.post("CloseReport", {
                token: reportToken
            }, !1, async).then(function() {
                return !0;
            });
        }
        function validateParameters(reportToken, parameters) {
            return $base.post("SetParameters", {
                token: reportToken,
                parametersSetAtClient: ar_convertClientParameters(parameters)
            }, !0).then(function(d) {
                var failedParams = ar_convertServiceParameters(d.ParameterCollection || []);
                return parameters.map(function(p) {
                    var f = failedParams.filter(function(fp) {
                        return fp.name == p.name;
                    });
                    return 1 == f.length ? f[0] : (p.state = ParameterState.Ok, p.error = "", p);
                });
            });
        }
        function validateParameter(reportToken, parameter) {
            return $base.post("ValidateParameter", {
                token: reportToken,
                surrogate: ar_convertClientParameter(parameter)
            }).then(function(d) {
                return ar_convertServiceParameters(d.ParameterCollection || []);
            });
        }
        function areValidParameters(parameters) {
            return parameters.every(function(p) {
                return p.state == ParameterState.Ok;
            });
        }
        function run(reportToken) {
            return runImpl(reportToken);
        }
        function runImpl(reportToken) {
            return $base.post("RunReport", {
                token: reportToken
            }).then(function() {
                return pollStatus(reportToken);
            }).then(function() {
                return getDocumentUrl(reportToken);
            });
        }
        function pollStatus(reportToken, returnPagesCount) {
            return $base.delay(getStatus.bind(service, reportToken), pollingTimeout).then(function(status) {
                return returnPagesCount ? status.pageCount : status.pageCount > 0 || pollStatus(reportToken);
            });
        }
        function getStatus(reportToken) {
            return $base.post("GetStatus", {
                token: reportToken
            }).then(function(d) {
                var state = d.LoadState;
                if (isUndefined(state) || isUndefined(d.AvailablePages)) return $base.errorPromise(SR("error.InvalidResponse"));
                switch (state) {
                  case loadStates.Error:
                    return $base.errorPromise(SR("error.RequestFailed"));

                  case loadStates.Cancelled:
                  case loadStates.Cancelling:
                    return $base.errorPromise(SR("error.RequestCancelled"));
                }
                return {
                    state: state,
                    pageCount: d.AvailablePages
                };
            });
        }
        function getPageCount(doctoken) {
            function getPageCountImpl() {
                getStatus(reportToken).done(function(status) {
                    status.state == loadStates.Completed ? def.resolve(status.pageCount) : (def.notify(status.pageCount), 
                    setTimeout(getPageCountImpl, pollingTimeout));
                }).fail(function(problem) {
                    def.reject(problem);
                });
            }
            var reportToken = resolveReportToken(doctoken);
            if (!reportToken) return $base.invalidArg("doctoken", doctoken);
            var def = $.Deferred();
            return getPageCountImpl(), def.promise();
        }
        function getPage(doctoken, index) {
            if (!resolveReportToken(doctoken)) return $base.invalidArg("doctoken", doctoken);
            var urlTemplate = "{0}&Page={1}&ie=" + $.now(), pageUrl = urlTemplate.format(doctoken, index + 1);
            return $base.get(pageUrl);
        }
        function getDocumentUrl(reportToken) {
            return $base.post("GetRenderedReportLink", {
                token: reportToken
            }).then(function(d) {
                var link = d.ReportLink;
                if (isUndefined(link) || isUndefined(link.Uri)) return $base.invalidResponse(d);
                var url = link.Uri;
                return url || resolveReportToken(url) ? url + "&WebViewerControlClientId=html5viewer&HtmlViewer=true" : $base.invalidResponse(d);
            });
        }
        function getToc(doctoken) {
            var reportToken = resolveReportToken(doctoken);
            return reportToken ? loadBookmarks(reportToken, -1).then(function(bookmarks) {
                return {
                    name: "$root",
                    kids: bookmarks
                };
            }) : $base.invalidArg("doctoken", doctoken);
        }
        function getBookmarks(token, parent, fromChild, count) {
            return $base.post("GetBookmarks", {
                token: token,
                parentId: parent,
                fromChild: fromChild,
                count: count
            }).then(function(d) {
                var bookmarks = (d.Bookmarks || []).map(function(b) {
                    var id = b.ID || 0, childCount = b.ChildrenCount || 0, location = b.Location || {
                        X: 0,
                        Y: 0
                    }, kids = [];
                    return childCount > 0 && (kids = function() {
                        return loadBookmarks(token, id);
                    }), {
                        name: b.Name || "",
                        page: b.Page || 0,
                        location: {
                            left: location.X,
                            top: location.Y
                        },
                        isLeaf: 0 === childCount,
                        kids: kids
                    };
                });
                return bookmarks.childCount = d.ChildrenCount || 0, bookmarks;
            });
        }
        function loadBookmarks(token, parent) {
            return loadBookmarksImpl(token, parent, 0).then(function(bookmarks) {
                return delete bookmarks.childCount, bookmarks;
            });
        }
        function toggle(token, toggleInfo) {
            return $base.post("ProcessOnClick", {
                token: token,
                data: toggleInfo
            }).then(function(result) {
                return pollStatus(token, !0);
            }).then(function(pagesCount) {
                return getDocumentUrl(token).then(function(url) {
                    var info = {
                        url: url,
                        pagesCount: pagesCount
                    };
                    return info;
                });
            });
        }
        function loadBookmarksImpl(token, parent, fromChild) {
            return getBookmarks(token, parent, fromChild, 100).then(function(kids) {
                var loadCount = fromChild + kids.length;
                return loadCount >= kids.childCount || loadCount >= maxBookmarksCount ? kids : loadBookmarksImpl(token, parent, loadCount).then(function(next) {
                    return kids.concat(next);
                });
            });
        }
        function resolveReportToken(url) {
            return getQueryParameter(url, "token");
        }
        function getExportUri(doctoken, exportType, settings) {
            var reportToken = resolveReportToken(doctoken);
            return reportToken ? $base.post("GetExportedReportLink", {
                token: reportToken,
                format: exportType,
                exportingParameters: settings,
                pageRange: null
            }).then(function(d) {
                var link = d.ReportLink;
                if (isUndefined(link) || isUndefined(link.Uri)) return $base.invalidResponse(d);
                var url = link.Uri;
                return url || resolveReportToken(url) ? url : $base.invalidResponse(d);
            }) : $base.invalidArg("doctoken", doctoken);
        }
        function exportImpl(doctoken, exportType, settings) {
            function translateSettings(ss) {
                var newSettings = {};
                return Object.keys(ss || {}).forEach(function(key) {
                    var val = ss[key];
                    switch (key) {
                      case "saveAsDialog":
                        val && (newSettings.SaveAsDialog = "true");
                        break;

                      case "printing":
                        val && (exportType == ExportType.Pdf ? newSettings.PrintOnOpen = !0 : exportType == ExportType.Html && (newSettings.WebViewer = !0, 
                        newSettings.Printing = !0));
                        break;

                      default:
                        newSettings[key] = val;
                    }
                }), newSettings;
            }
            return getPageCount(doctoken).then(function(pc) {
                if (0 >= pc) throw new Error("document cannot be exported");
                return getExportUri(doctoken, exportType, translateSettings(settings));
            });
        }
        function search(token, searchOptions) {
            var maxSearchResults = searchOptions.maxSearchResults || options.maxSearchResults || defaultMaxSearchResults, reportToken = resolveReportToken(token);
            return reportToken ? $base.post("Search", {
                token: reportToken,
                options: {
                    Text: searchOptions.text,
                    MatchCase: searchOptions.matchCase,
                    WholeWord: searchOptions.wholePhrase,
                    SearchBackward: !1
                },
                startFrom: searchOptions.from ? {
                    ItemIndex: searchOptions.from.idx,
                    TextLen: 1,
                    PageIndex: searchOptions.from.page
                } : {
                    PageIndex: -1
                },
                numberOfResults: maxSearchResults
            }).then(function(d) {
                var dpi = getDpi();
                return {
                    hasMore: d.SearchResults.length == maxSearchResults,
                    matches: d.SearchResults.map(function(sr) {
                        return {
                            idx: sr.ItemIndex,
                            text: sr.DisplayText,
                            page: sr.PageIndex,
                            location: {
                                left: sr.ItemArea.X * dpi,
                                top: sr.ItemArea.Y * dpi,
                                width: sr.ItemArea.Width * dpi,
                                height: sr.ItemArea.Height * dpi
                            }
                        };
                    })
                };
            }) : $base.invalidArg("token", token);
        }
        function drillthrough(token, link) {
            var drillInfo = parseDrillthroughLink(link);
            return drillInfo && drillInfo.reportName ? openDrillthrough(token, drillInfo.reportName, drillInfo.parameters) : $base.errorPromise(SR("error.InvalidDrillthroughLink").format(link));
        }
        function openDrillthrough(token, reportPath, parameters) {
            return openDrillthroughReport(token, reportPath).then(function(r) {
                function run() {
                    return runImpl(r.token).then(function(documentToken) {
                        return {
                            reportToken: r.token,
                            parameters: params,
                            documentToken: documentToken
                        };
                    });
                }
                function findAndUpdateValue(parameter, clientParams) {
                    var cp = clientParams.filter(function(x) {
                        return x.name == parameter.name;
                    });
                    return updateValue(parameter, cp[0]);
                }
                function resolveDependencies(dependencies) {
                    return $.Deferred(function(deferred) {
                        if (dependencies.length > 0) {
                            var dependecy = dependencies.pop();
                            validateParameter(r.token, dependecy).then(function(updated) {
                                return params = params.map(function(p) {
                                    var f = updated.filter(function(u) {
                                        return u.name == p.name;
                                    });
                                    return 1 == f.length ? findAndUpdateValue(f[0], parameters) : p;
                                }), resolveDependencies(dependencies);
                            }).done(deferred.resolve).fail(deferred.reject);
                        } else deferred.resolve();
                    }).promise();
                }
                function resolveDependantParameters() {
                    return $.Deferred(function(deferred) {
                        var dependantParameters = params.filter(function(p) {
                            return p.state == ParameterState.HasOutstandingDependencies;
                        });
                        if (dependantParameters.length > 0) {
                            var dependant = dependantParameters[0], dependencies = params.filter(function(p) {
                                return p.dependantParameterNames && -1 != p.dependantParameterNames.indexOf(dependant.name);
                            });
                            dependencies.length > 0 ? resolveDependencies(dependencies).then(resolveDependantParameters).done(deferred.resolve).fail(deferred.reject) : deferred.reject();
                        } else deferred.resolve();
                    }).promise();
                }
                var params = mergeParameters(r.parameters, parameters);
                return params && params.length > 0 ? resolveDependantParameters().then(function() {
                    return validateParameters(r.token, params);
                }).then(function(p) {
                    return areValidParameters(p) && r.autoRun ? run() : {
                        reportToken: r.token,
                        parameters: params
                    };
                }) : run();
            });
        }
        function updateValue(parameter, clientParameter) {
            function convertValue(value, type) {
                if (type == ParameterType.DateTime) {
                    if ("" === value) return null;
                    if (!Date.isDate(value)) {
                        var d = new Date();
                        return d.setTime(Date.parse(value)), isNaN(d) && (d = parseParameterValue(value, ServiceParameterType.DateTime)), 
                        d;
                    }
                    return value;
                }
                return value;
            }
            function findParameterByValue(valuetosearch) {
                for (var i = 0; i < parameter.availableValues.length; i++) if (parameter.availableValues[i].value == valuetosearch) return parameter.availableValues[i];
                return null;
            }
            if (void 0 === clientParameter || null === clientParameter) return parameter;
            if (parameter.multivalue) if (clientParameter.values) parameter.values = clientParameter.values; else {
                if (parameter.values.length > 0 && (parameter.values = []), !Array.isArray(clientParameter.value)) {
                    var t = clientParameter.value;
                    clientParameter.value = [], clientParameter.value.push(t);
                }
                clientParameter.value.map(function(p) {
                    var param = findParameterByValue(p);
                    param || (param = convertValue(p, parameter.type)), parameter.values.push(param);
                });
            } else parameter.value = convertValue(clientParameter.value, parameter.type);
            return parameter;
        }
        function mergeParameters(reportParams, clientParams) {
            var names = [], merged = reportParams.map(function(p) {
                names.push(p.name);
                var cp = clientParams.filter(function(clientParameter) {
                    return p.name == clientParameter.name;
                });
                return 0 === cp.length ? p : updateValue(p, cp[0]);
            });
            return merged.push.apply(merged, clientParams.filter(function(p) {
                return -1 == names.indexOf(p.name);
            }).map(function(p) {
                return void 0 === p.promptUser && (p.promptUser = !1), p;
            })), merged;
        }
        function parseDrillthroughLink(link) {
            function GetViewModel(id) {
                return reportName = id, {
                    goToReport: function(reportName, pp) {
                        xreportName = reportName;
                        for (var i in pp) params.push({
                            name: i,
                            value: pp[i]
                        });
                    }
                };
            }
            var xreportName = "", params = [];
            try {
                var re = new RegExp("&quot;", "g");
                link = link.replace(re, '"'), eval(link);
            } catch (e) {
                return null;
            }
            return {
                reportName: xreportName,
                parameters: params
            };
        }
        if (!options.url) throw new Error("options has no valid url");
        var defaultMaxSearchResults = 50, pagesPollingTimeout = 1e3, pollingTimeout = options.pollingTimeout || pagesPollingTimeout, serviceUrl = options.url;
        serviceUrl.endsWith("/") || (serviceUrl += "/");
        var SR = resourceManager && $.isFunction(resourceManager.get) ? resourceManager.get : identity, formats = {
            Rdf: 0,
            Ddf: 1,
            Xaml: 2,
            Image: 3,
            Pdf: 4,
            Html: 5,
            Word: 6,
            Xls: 7,
            Xml: 8
        }, loadStates = {
            NotStarted: 0,
            InProgress: 1,
            Completed: 2,
            Cancelling: 3,
            Cancelled: 4,
            Error: 5
        }, documentFormat = {
            rpx: 0,
            rdf: 1,
            rdlx: 2
        }, service = {
            open: open,
            close: close,
            toggle: toggle,
            run: run,
            validateParameters: validateParameters,
            validateParameter: validateParameter,
            validateParameterSupported: function() {
                return !0;
            },
            getPageCount: getPageCount,
            getPage: getPage,
            getToc: getToc,
            "export": exportImpl,
            search: search,
            drillthrough: drillthrough,
            ping: ping
        }, $base = ReportServiceBase(service, serviceUrl), maxBookmarksCount = 1e5;
        return service;
    }
    function ars_convertClientParameters(parameters) {
        function convertValue(value) {
            return Date.isDate(value) ? Date.format(value, "MM/dd/yyyy HH:mm:ss") : value;
        }
        var paramDomain = {
            specifiedValues: 0,
            selectAll: 1,
            acceptingDynamicValues: 2
        };
        return (parameters || []).map(function(p) {
            if (p.multivalue) {
                var values = p.values.map(function(pv) {
                    return convertValue(pv.hasOwnProperty("value") ? pv.value : pv);
                }).filter(function(v) {
                    return null !== v && void 0 !== v;
                });
                return 1 == values.length && values[0] == ParameterSpecialValue.SelectAll ? {
                    Name: p.name,
                    Domain: paramDomain.selectAll,
                    Values: []
                } : {
                    Name: p.name,
                    Domain: paramDomain.specifiedValues,
                    Values: values
                };
            }
            return {
                Name: p.name,
                Domain: paramDomain.specifiedValues,
                Values: [ convertValue(p.value) ].filter(function(v) {
                    return null !== v && void 0 !== v;
                })
            };
        });
    }
    function arsParametersParser(resourceManager) {
        function convertDataType(value) {
            var map = {
                string: ParameterType.String,
                "boolean": ParameterType.Bool,
                bool: ParameterType.Bool,
                datetime: ParameterType.DateTime,
                integer: ParameterType.Int,
                "int": ParameterType.Int,
                "float": ParameterType.Float
            };
            return map[(value || "").toLowerCase()] || ParameterType.String;
        }
        function convertState(value) {
            var map = {
                hasvalidvalue: ParameterState.Ok,
                missingvalidvalue: ParameterState.ExpectValue,
                hasoutstandingdependencies: ParameterState.HasOutstandingDependencies,
                dynamicvaluesunavailable: ParameterState.DynamicValuesUnavailable
            };
            return map[(value || "").toLowerCase()] || ParameterState.Ok;
        }
        function parseValue(value, type) {
            if (null === value) return null;
            switch (type) {
              case ParameterType.Bool:
                return Boolean.parse(value);

              case ParameterType.Int:
              case ParameterType.Float:
                return "" === value ? null : +value;

              case ParameterType.DateTime:
                if ("" === value) return null;
                if (!Date.isDate(value)) {
                    var d = new Date();
                    return d.setTime(Date.parse(value)), d;
                }
                return value;
            }
            return value;
        }
        function parseSpecialValue(value, parameter) {
            var valueToLower = value.toLowerCase();
            return {
                label: function() {
                    return "blank" === valueToLower || "empty" === valueToLower ? resourceManager.get(valueToLower) : value;
                }(),
                value: function() {
                    switch (valueToLower) {
                      case "blank":
                      case "empty":
                        return parameter.type == ParameterType.String ? "" : null;

                      case "null":
                        return null;

                      case "unspecified":
                        return parameter.nullable ? null : void 0;

                      case "selectall":
                        return ParameterSpecialValue.SelectAll;

                      default:
                        return value;
                    }
                }()
            };
        }
        function resolveEditor(p) {
            return p.multiline && p.type == ParameterType.String ? ParameterEditorType.MultiLine : p.multivalue ? ParameterEditorType.MultiValue : p.definesValidValues && p.availableValues.length > 0 ? ParameterEditorType.SelectOneFromMany : ParameterEditorType.SingleValue;
        }
        function ars_parseParametersXml(xml) {
            function parseValuesElement(e, parameter) {
                return $(e).children().map(function() {
                    var $this = $(this), stringValue = $this.text(), attrs = (stringValue.toLowerCase(), 
                    $this.attrs()), isSpecial = Boolean.parse(attrs.isspecial);
                    return isSpecial ? parseSpecialValue(stringValue, parameter) : {
                        label: attrs.label || stringValue,
                        value: parseValue(stringValue, parameter.type)
                    };
                }).get();
            }
            function isDateOnlyDateDomain(dateDomain) {
                return "Day" == dateDomain || "Month" == dateDomain || "MonthFixedYear" == dateDomain || "Year" == dateDomain;
            }
            return $(xml).find("Parameter").map(function() {
                var $this = $(this), attrs = $this.attrs(), multivalue = Boolean.parse(attrs.multivalue), parameter = {
                    name: attrs.name || "",
                    type: convertDataType(attrs.datatype),
                    hidden: Boolean.parse(attrs.hidden),
                    multivalue: multivalue,
                    multiline: Boolean.parse(attrs.multiline || "false"),
                    allowEmpty: Boolean.parse(attrs.allowblank),
                    dateOnly: isDateOnlyDateDomain(attrs.datedomain),
                    nullable: Boolean.parse(attrs.nullable) && !multivalue,
                    prompt: attrs.prompt || attrs.name || "",
                    state: convertState(attrs.state),
                    promptUser: Boolean.parse(attrs.promptuser),
                    definesValidValues: Boolean.parse(attrs.definesvalidvalues),
                    selectAllEnabled: Boolean.parse(attrs.selectallenabled),
                    dateDomain: attrs.datedomain || "",
                    hasDependantParameters: $this[0].getElementsByTagName("DependentParameters").length > 0
                };
                return $.each(this.childNodes, function() {
                    switch (this.nodeName.toLowerCase()) {
                      case "values":
                        parameter.values = parseValuesElement(this, parameter);
                        break;

                      case "validvalues":
                        parameter.availableValues = parseValuesElement(this, parameter);
                    }
                }), parameter.values = parameter.values || [], parameter.value = parameter.values.length ? parameter.values[0].value : null, 
                parameter.editor = resolveEditor(parameter), parameter.error = "", parameter;
            }).get();
        }
        function convertServerParameters(parameters) {
            function parseAvailableValues(values, dataType) {
                return values.map(function(v) {
                    return {
                        label: v.Label || v.Value,
                        value: parseValue(v.Value, dataType)
                    };
                });
            }
            function parseValues(values, parameter) {
                return values.map(function(v) {
                    if (v.IsSpecial) return parseSpecialValue(v.Value, parameter);
                    var value = parseValue(v.Value, parameter.type), expectedValues = parameter.availableValues.filter(function(av) {
                        return av.value === value;
                    });
                    return {
                        label: expectedValues && expectedValues.length && expectedValues[0].label || v.Value,
                        value: value
                    };
                });
            }
            return parameters.map(function(p) {
                var parameter = {
                    name: p.Name || "",
                    type: convertDataType(p.DataType),
                    hidden: p.Hidden,
                    multivalue: p.MultiValue,
                    multiline: p.MultiLine || !1,
                    allowEmpty: p.AllowBlank,
                    dateOnly: p.DateOnly,
                    nullable: p.Nullable && !p.MultiValue,
                    prompt: p.Prompt || p.Name || "",
                    state: convertState(p.State),
                    definesValidValues: p.DefinesValidValues,
                    selectAllEnabled: p.SelectAllEnabled,
                    hasDependantParameters: !(!p.DependentParameters || !p.DependentParameters.length),
                    dependantParameterNames: p.DependentParameters
                };
                return parameter.availableValues = parseAvailableValues(p.AvailableValues || [], parameter.type), 
                parameter.values = parseValues(p.Values || [], parameter), parameter.state == ParameterState.Ok && parameter.values && 1 == parameter.values.length && "Unspecified" == parameter.values[0].label && (parameter.state = ParameterState.ExpectValue), 
                parameter.value = parameter.values.length ? parameter.values[0].value : null, parameter.editor = resolveEditor(parameter), 
                parameter.error = "", parameter;
            });
        }
        return {
            convertServerParameters: convertServerParameters,
            parseParametersXml: ars_parseParametersXml
        };
    }
    function ArsReportService(options, resourceManager) {
        function documentBase(html) {
            var doc = $("<div/>");
            doc.html(html);
            var style = doc.find("style");
            if (style.length) {
                var text = style.text();
                text = text.replace(/background-image\s*:\s*url\((.*)\)/g, function(match, url) {
                    return url = url.replace(/&amp;/g, "&"), url = isAbsoluteUri(url) ? url : resourceHandler + url, 
                    "background-image:url({0})".format(url);
                }), style.text(text);
            }
            doc.find("img").each(function() {
                var $this = $(this), src = $this.attr("src");
                isBase64(src) || isAbsoluteUri(src) || (src += "&MobileGet=1", $this.attr("src", resourceHandler + src));
            });
            var tocUrl = doc.find("meta[name=tocUrl]").attr("content"), documentId = doc.find("meta[name=DocumentId]").attr("content");
            return {
                html: doc,
                tocUrl: tocUrl,
                documentId: documentId
            };
        }
        function pageDocument(token, html) {
            function getPage(index) {
                var page = html.clone();
                return page.children("div").children("div.page").not(function(i) {
                    return i == index;
                }).remove(), page.html();
            }
            function exportType(extension) {
                switch (extension) {
                  case "Xls":
                    return "Excel";

                  default:
                    return extension;
                }
            }
            var $base = documentBase(html);
            html = $base.html, html.find("div.page").children().filter(function() {
                return "absolute" === $(this).css("position");
            }).css("position", "relative").css("left", "").css("top", "");
            var pages = html.find("div.page").length;
            return $.extend($base, {
                reportToken: token,
                pages: pages,
                getPage: getPage,
                exportType: exportType
            });
        }
        function sectionDocument(token, html) {
            function getPage(index) {
                var page = html.clone();
                return page.children("div").not(function(i) {
                    return i == index;
                }).remove(), page.html();
            }
            function exportType(extension) {
                switch (extension) {
                  case "Xls":
                    return "Excel";

                  case "Word":
                    return "Rtf";

                  default:
                    return extension;
                }
            }
            var $base = documentBase(html);
            html = $base.html;
            var pages = html.children("div").length;
            return $.extend($base, {
                reportToken: token,
                pages: pages,
                getPage: getPage,
                exportType: exportType
            });
        }
        function close(async) {
            return state = {
                togglesHistory: null,
                documentId: null,
                hiddenParameters: []
            }, $base.promise(!0);
        }
        function open(reportId, parameters) {
            service.close();
            var idrev = (reportId || "").split("."), version = null;
            if (idrev.length > 1) {
                var lastIndex = idrev.length - 1;
                version = parseInt(idrev[lastIndex]), isNaN(version) && (version = null), null === version && (lastIndex += 1), 
                reportId = idrev.slice(0, lastIndex).join(".");
            }
            return $base.getReport(reportId, version).then(function(list) {
                if (0 === list.length) return $base.errorPromise(SR("error.ReportNotFound").format(reportId));
                var desc = list[0];
                return version && (desc.Version = version), {
                    token: {
                        description: desc,
                        id: desc._id || desc.Id
                    },
                    parameters: [],
                    hasParameters: !!desc.IsParametrized,
                    reportType: getReportType(desc.ReportType),
                    autoRun: !0
                };
            }).then(function(report) {
                return report.hasParameters || parameters && 0 !== parameters.length ? resolveParameters(report.token, parameters).then(function(resolvedParameters) {
                    return $.extend(report, {
                        parameters: resolvedParameters
                    });
                }) : report;
            });
        }
        function getReportType(arsReportType) {
            return arsReportType === reportTypes.SemanticReport || arsReportType === reportTypes.PageReport ? ReportType.pageReport : arsReportType === reportTypes.SectionReport || arsReportType === reportTypes.CodeBasedReport ? ReportType.sectionReport : ReportType.unknown;
        }
        function run(reportToken, parameters) {
            var description = reportToken.description, renderParameters = ars_convertClientParameters(overrideHiddenParameters(parameters));
            return $base.renderReport(description, renderParameters).then(function(html) {
                var document;
                return document = description.ReportType == reportTypes.SectionReport || description.ReportType == reportTypes.CodeBasedReport ? sectionDocument(reportToken, html) : pageDocument(reportToken, html), 
                state.togglesHistory = new TogglesHistory(), state.documentId = document.documentId, 
                document;
            });
        }
        function overrideHiddenParameters(parameters) {
            var notOverriddenHiddenParameters = state.hiddenParameters.filter(function(hiddenParameter) {
                return !parameters.some(function(parameter) {
                    return parameter.name == hiddenParameter.name;
                });
            });
            return notOverriddenHiddenParameters.concat(parameters);
        }
        function removeDependants(parameters, dependantNames) {
            var allDependantsNames = allDependants(parameters, dependantNames);
            return parameters.filter(function(p) {
                return -1 === allDependantsNames.indexOf(p);
            });
        }
        function allDependants(parameters, dependantNames) {
            dependantNames = dependantNames ? dependantNames : [];
            var firstGen = parameters.filter(function(p) {
                return -1 !== dependantNames.indexOf(p.name);
            }), res = firstGen.slice();
            return firstGen.forEach(function(p) {
                res = res.concat(allDependants(parameters, p.dependantParameterNames));
            }), res;
        }
        function resolveParameters(reportToken, parameters, dependantNames) {
            var paramsForResolving = removeDependants(overrideHiddenParameters(parameters), dependantNames);
            return $base.resolveParameters(reportToken.description, ars_convertClientParameters(paramsForResolving)).then(function(parsedParameters) {
                var notHiddenParameters = [];
                return state.hiddenParameters = [], parsedParameters.forEach(function(parsedParameter) {
                    reportToken.description.ReportType == reportTypes.SemanticReport && (parsedParameter.state == ParameterState.Ok && parsedParameter.values && 1 == parsedParameter.values.length && "Unspecified" == parsedParameter.values[0].label && (parsedParameter.state = ParameterState.ExpectValue), 
                    parsedParameter.nullable = !1), parsedParameter.hidden ? state.hiddenParameters.push(parsedParameter) : notHiddenParameters.push(parsedParameter);
                }), notHiddenParameters;
            });
        }
        function exportImpl(token, exportType, settings) {
            function translateSettings(ss) {
                var newSettings = {};
                return Object.keys(ss || {}).forEach(function(key) {
                    var val = ss[key];
                    switch (key) {
                      case "printing":
                        val && (exportType == ExportType.Pdf ? newSettings.PrintOnOpen = !0 : exportType == ExportType.Html && (newSettings = $.extend(newSettings, {
                            WebViewer: !0,
                            MhtOutput: !1,
                            RenderTocTree: !1,
                            OutputTOC: !1,
                            Interactivity: !1,
                            RenderMode: "Paginated",
                            Pagination: !0,
                            StyleStream: !1,
                            IncludePageMargins: !1,
                            Printing: !0
                        })));
                        break;

                      default:
                        newSettings[key] = val;
                    }
                }), newSettings;
            }
            if (!token) return $base.errorPromise(SR("error.InvalidReportToken"));
            var description = token.reportToken.description, exportOptions = {
                DocumentId: token.documentId ? token.documentId : state.documentId,
                ToggleHistory: state.togglesHistory.getSet(),
                ExtensionSettings: translateSettings(settings)
            };
            return $base.exportDocument(description, token.exportType(exportType), exportOptions).then(function(url) {
                return isAbsoluteUri(url) || (url = resourceHandler + url), url;
            });
        }
        function validateParameters(reportToken, parameters, dependantNames) {
            return resolveParameters(reportToken, parameters, dependantNames);
        }
        function getPageCount(document) {
            return document ? $base.promise(document.pages || 1) : $base.errorPromise(SR("error.InvalidDocumentToken"));
        }
        function getPage(document, index) {
            return document ? (index >= document.pages && (index = 0), $base.promise(document.getPage(index))) : $base.errorPromise(SR("error.InvalidDocumentToken"));
        }
        function getToc(document) {
            if (!document) return $base.errorPromise(SR("error.InvalidDocumentToken"));
            var tocUrl = document.tocUrl;
            return tocUrl ? (tocUrl += "&MobileGet=1", getResource(tocUrl, !0).then(function(toc) {
                return toc;
            }).fail(function() {
                return emptyToc();
            })) : emptyToc();
        }
        function emptyToc() {
            return $base.promise({
                name: "$root",
                kids: []
            });
        }
        function loadResource(url) {
            return getResource(url).then(function(data, textStatus, xhr) {
                if (206 == xhr.status) {
                    var xml = $(data), requestId = xml.find("RequestId").text();
                    return requestId ? $base.getResourceId(requestId).then(loadResource) : $base.errorPromise(SR("error.InvalidRequestId"));
                }
                return data;
            });
        }
        function getResource(url, json) {
            return url += "&NoWrapper=1", isAbsoluteUri(url) || (url = resourceHandler + url), 
            json ? $base.getJson(url) : $base.get(url);
        }
        function toggle(token, toggleInfo) {
            state.togglesHistory.toggle(toggleInfo.Data);
            var description = token.description, renderOptions = {
                DocumentId: state.documentId,
                Name: description.Name,
                ReportType: description.ReportType,
                ToggleHistory: state.togglesHistory.getSet(),
                ExtensionSettings: {
                    RenderMode: "Paginated",
                    NeedExportSupport: !0,
                    TocStream: !0,
                    IncludePageMargins: !0
                }
            };
            return $base.exportDocument(description, "Html", renderOptions).then(loadResource).then(function(html) {
                var count;
                if (description.ReportType == reportTypes.SectionReport || description.ReportType == reportTypes.CodeBasedReport) {
                    var sectionDoc = sectionDocument(token, html);
                    return getPageCount(sectionDoc).done(function(pagesCount) {
                        count = pagesCount;
                    }), {
                        url: sectionDoc,
                        pagesCount: count
                    };
                }
                var pageDoc = pageDocument(token, html);
                return getPageCount(pageDoc).done(function(pagesCount) {
                    count = pagesCount;
                }), {
                    url: pageDoc,
                    pagesCount: count
                };
            });
        }
        function drillthrough(token, link) {
            var drillInfo = parseDrillthroughLink(token, link);
            return drillInfo && drillInfo.reportName ? openDrillthrough(token, drillInfo.reportName, drillInfo.params) : $base.errorPromise(SR("error.InvalidDrillthroughLink").format(link));
        }
        function parseDrillthroughLink(token, link) {
            function parseParameters(str) {
                var result = [], parameters = splitEscaped(str, ";");
                return parameters.forEach(function(parameter) {
                    var keyValue = splitEscaped(parameter, "=");
                    if (keyValue.length > 1) {
                        var key = keyValue[0], value = keyValue[1];
                        if (key) {
                            var values = splitEscaped(value, ",");
                            values.length > 1 ? result.push({
                                name: key,
                                values: values.map(function(v) {
                                    return {
                                        value: v
                                    };
                                }),
                                multivalue: !0
                            }) : result.push({
                                name: key,
                                value: values[0]
                            });
                        }
                    }
                }), result;
            }
            var queryStart = link.indexOf("?");
            if (-1 == queryStart) return {
                reportName: "",
                params: []
            };
            var reportName = "", params = [], query = link.slice(queryStart + 1);
            return query.split("&").forEach(function(queryItem, i, _) {
                var parts = queryItem.split(/=(.*)/);
                parts.length < 2 || ("ReportId" == parts[0] ? reportName = decodeURIComponent(parts[1]) : "Parameters" == parts[0] && (params = parseParameters(decodeURIComponent(parts[1]))));
            }), "self" == reportName && (reportName = token.id), {
                reportName: reportName,
                params: params
            };
        }
        function openDrillthrough(token, reportName, parameters) {
            return service.open(reportName, parameters).then(function(report) {
                var parametersValid = report.parameters.every(function(p) {
                    return p.state == ParameterState.Ok;
                });
                return parametersValid ? service.run(report.token, report.parameters).then(function(documentToken) {
                    return {
                        reportToken: report.token,
                        parameters: report.parameters,
                        documentToken: documentToken
                    };
                }) : {
                    reportToken: report.token,
                    parameters: report.parameters
                };
            });
        }
        var state;
        if (!options.url) throw new Error("options has no valid url");
        var SR = resourceManager && $.isFunction(resourceManager.get) ? resourceManager.get : identity, serviceUrl = options.url, resourceHandler = options.resourceHandler || "";
        serviceUrl.endsWith("/") || (serviceUrl += "/");
        var service = {
            open: open,
            close: close,
            run: run,
            validateParameters: validateParameters,
            validateParameter: function() {
                return $base.errorPromise(SR("error.NotSupported"));
            },
            validateParameterSupported: function() {
                return !1;
            },
            getPageCount: getPageCount,
            getPage: getPage,
            getToc: getToc,
            "export": exportImpl,
            drillthrough: drillthrough,
            toggle: toggle,
            ping: function() {
                return $base.promise(!1);
            }
        }, $base = options.url && -1 !== options.url.toLowerCase().indexOf("reportservice.svc") ? ArsWcfReportService(service, serviceUrl, options, resourceManager, loadResource) : ArsRestReportService(service, serviceUrl, options.securityToken, resourceManager), reportTypes = $base.reportTypes;
        return close(), service;
    }
    function ArsRestReportService(service, serviceUrl, securityToken, resourceManager) {
        function setAuthToken(ajaxOptions) {
            return securityToken && (ajaxOptions.headers = {
                AuthToken: securityToken
            }), ajaxOptions;
        }
        function getReport(reportId, version) {
            var url = "reports?selector=" + JSON.stringify({
                $or: [ {
                    _id: {
                        $eqi: reportId
                    }
                }, {
                    Name: {
                        $eqi: reportId
                    }
                } ]
            });
            return null !== version && (url = url + "&version=" + version), $base.get(url).then(function(reports) {
                return reports.forEach(function(r) {
                    r.ReportType = r.Type;
                }, this), reports;
            });
        }
        function renderReport(description, parameters) {
            var renderOptions = {
                ExtensionName: "Html",
                ExtensionSettings: {
                    Target: "Screen",
                    RenderMode: "Paginated",
                    NeedExportSupport: !0,
                    IncludePageMargins: !0,
                    TocStream: !0
                },
                ReportParameters: parameters
            }, id = description._id;
            return description.Version && (id = id + "." + description.Version), runTask("reports/" + id + "/renderingRequests", renderOptions).then(function(res) {
                return handleRequestResult("renderingRequests", res);
            });
        }
        function resolveParameters(description, parameters) {
            return runTask("reports/" + description._id + "/parameters/validateValues/v2", parameters).then(function(parameters) {
                return arsParametersParser(resourceManager).convertServerParameters(parameters);
            });
        }
        function exportDocument(description, extensionName, exportOptions) {
            return exportOptions.ExtensionName = extensionName, runTask("reports/" + description._id + "/exportRequests", exportOptions).then(function(res) {
                return handleRequestResult("exportRequests", res);
            });
        }
        function runTask(method, taskOptions) {
            return $base.postRest(method, taskOptions);
        }
        function handleRequestResult(requestType, result) {
            return null !== result && "object" == typeof result && result.RequestId ? getRequestResult(requestType, result.RequestId) : result;
        }
        function getRequestResult(requestType, requestId) {
            return $base.get("reports/" + requestType + "/" + requestId).then(function(res) {
                return handleRequestResult(requestType, res);
            });
        }
        function getResourceId(requestId) {
            return handleRequestResult("exportRequests", {
                RequestId: requestId
            });
        }
        var reportTypes = {
            SemanticReport: "SemanticReport",
            SectionReport: "SectionReport",
            PageReport: "PageReport",
            CodeBasedReport: "CodeBasedSectionReport"
        }, $base = ReportServiceBase(service, serviceUrl, setAuthToken);
        return {
            getReport: getReport,
            resolveParameters: resolveParameters,
            getResourceId: getResourceId,
            renderReport: renderReport,
            exportDocument: exportDocument,
            reportTypes: reportTypes,
            get: $base.get,
            getJson: $base.getJson,
            promise: $base.promise,
            errorPromise: $base.errorPromise
        };
    }
    function ArsWcfReportService(service, serviceUrl, options, resourceManager, loadResource) {
        function mapSettings(settings) {
            return Object.keys(settings || {}).map(function(key) {
                return {
                    Key: key,
                    Value: null === settings[key] ? null : settings[key].toString()
                };
            });
        }
        function post(method, data) {
            return data.token = options.securityToken, $base.post(method, data);
        }
        function getReport(reportId) {
            return post("Select", {}).then(function(list) {
                return list.filter(function(d) {
                    return d.Id == reportId || d.Name.toLowerCase() == reportId.toLowerCase();
                });
            });
        }
        function resolveParameters(description, parameters) {
            var renderOptions = {
                ReportId: description.Id,
                Name: description.Name,
                ReportType: description.ReportType,
                Extension: "Html",
                ReportParameters: parameters
            };
            return runTask("ResolveParameters", description, renderOptions).then(loadResource).then(function(resource) {
                return arsParametersParser(resourceManager).parseParametersXml(resource);
            });
        }
        function getResourceIdByRequestId(requestId) {
            return getResourceId({
                Info: {
                    State: requestStates.Running,
                    RequestId: requestId
                }
            });
        }
        function getResourceId(requestResult) {
            var requestInfo = requestResult.Info;
            switch (requestInfo.State) {
              case requestStates.Unavailable:
              case requestStates.Rejected:
                var err = (requestInfo.Exception || {}).Message || "";
                return $base.errorPromise(resourceManager("error.RequestRejected") + " " + err);

              case requestStates.Cancelled:
                return $base.errorPromise(resourceManager("error.RequestCancelled"));

              case requestStates.Pending:
              case requestStates.Running:
                return $base.delay(function() {
                    return post("GetRequestStatus", {
                        requestId: requestInfo.RequestId
                    });
                }, pollingTimeout).then(getResourceId);

              default:
                return encodeURI(requestInfo.PrimaryUrl + "&MobileGet=1");
            }
        }
        function renderReport(description, parameters) {
            var renderOptions = {
                ReportId: description.Id,
                Name: description.Name,
                ReportType: description.ReportType,
                Extension: "Html",
                ExtensionSettings: mapSettings({
                    Target: "Screen",
                    RenderMode: "Paginated",
                    NeedExportSupport: !0,
                    IncludePageMargins: !0,
                    TocStream: !0
                }),
                ReportParameters: parameters
            };
            return runTask("RenderReport", description, renderOptions).then(loadResource);
        }
        function exportDocument(description, extensionName, exportOptions) {
            return exportOptions.Extension = extensionName, exportOptions.ExtensionSettings = mapSettings(exportOptions.ExtensionSettings), 
            runTask("ExportDocument", description, exportOptions);
        }
        function runTask(method, description, taskOptions) {
            return post(method, {
                description: description,
                options: taskOptions
            }).then(getResourceId);
        }
        var defaultPollingTimeout = 1e3, pollingTimeout = options.pollingTimeout || defaultPollingTimeout, reportTypes = {
            SemanticReport: 1,
            SectionReport: 2,
            PageReport: 3,
            CodeBasedReport: 4
        }, requestStates = {
            Pending: 0,
            Running: 1,
            Unavailable: 2,
            Accomplished: 3,
            Cancelled: 4,
            Rejected: 5
        }, $base = ReportServiceBase(service, serviceUrl);
        return {
            getReport: getReport,
            resolveParameters: resolveParameters,
            getResourceId: getResourceIdByRequestId,
            renderReport: renderReport,
            exportDocument: exportDocument,
            reportTypes: reportTypes,
            get: $base.get,
            getJson: $base.getJson,
            promise: $base.promise,
            errorPromise: $base.errorPromise
        };
    }
    function BrowserSpecific() {
        function isEdge() {
            return -1 != navigator.userAgent.indexOf("Edge");
        }
        return {
            PrintButtonVisibility: !isEdge()
        };
    }
    function ClientSideSearchService() {
        function search(document, searchOptions) {
            function fillResults(items, regex, numberOfMatches) {
                for (var fromIndex = currentPage == options.FromPage + 1 && options.FromElement > 0 ? options.FromElement + 1 : 0, i = fromIndex; i < items.length; i++) {
                    var element = items[i], elementText = element.text();
                    if (elementText.match(regex) && (result.matches.push({
                        idx: i,
                        text: elementText,
                        page: currentPage - 1
                    }), result.matches.length === numberOfMatches)) break;
                }
                return numberOfMatches != ALL_RESULTS && result.matches.length >= numberOfMatches;
            }
            function searchOnCurrentPage(regex) {
                var hasMorePages = document.state() === DocumentState.completed && document.pageCount() >= currentPage + 1;
                fillResults(cachedItems, regex, options.NumberOfResults) || !hasMorePages ? (result.hasMore = hasMorePages, 
                d.resolve(result)) : document.state() === DocumentState.progress && document.pageCount() <= currentPage + 1 ? setTimeout(searchOnCurrentPage, 100) : getPageItems(document, currentPage).done(function(items) {
                    cachedItems = items, currentPage++, searchOnCurrentPage(regex);
                });
            }
            var d = $.Deferred(), result = {
                hasMore: !0,
                matches: []
            };
            if (null === searchOptions || void 0 === searchOptions) return d.resolve({
                hasMore: !1,
                matches: []
            });
            var options = ensureOptions(searchOptions);
            return 0 === options.FromPage && 0 === options.FromElement && (cachedItems = [], 
            currentPage = 0), searchOnCurrentPage(createRegex(searchOptions)), d.promise();
        }
        function getPageItems(document, pageIndex) {
            return document.getPage(pageIndex).then(getStrippedTextElements);
        }
        function getStrippedTextElements(page) {
            return getTextElements(page, !0);
        }
        function ensureOptions(searchOptions) {
            var startFromPage = searchOptions && searchOptions.from && searchOptions.from.page || 0, startFromIndex = searchOptions && searchOptions.from && searchOptions.from.idx || 0, numberOfResults = searchOptions.maxSearchResults, maxResultCount = !numberOfResults || 0 > numberOfResults ? ALL_RESULTS : numberOfResults;
            return {
                FromPage: startFromPage,
                FromElement: startFromIndex,
                NumberOfResults: maxResultCount
            };
        }
        function createRegex(searchOptions) {
            for (var escapeChars = "\\|[]()+*.{}$^?", pattern = "", i = 0; i < searchOptions.text.length; i++) {
                var ch = searchOptions.text[i];
                escapeChars.indexOf(ch) >= 0 && (pattern += "\\"), pattern += ch;
            }
            searchOptions.wholePhrase && (pattern = "\\b" + pattern, pattern += "\\b");
            var flags = "m";
            return searchOptions.matchCase || (flags += "i"), new RegExp(pattern, flags);
        }
        var service = {
            search: search
        }, ALL_RESULTS = "ALL", cachedItems = [], currentPage = 0;
        return service;
    }
    function noop() {}
    function identity(v) {
        return v;
    }
    function isAbsoluteUri(uri) {
        return /^https?:\/\//i.test(uri);
    }
    function isBase64(uri) {
        var r = new RegExp("^data:\\w+/\\w+;base64,", "i");
        return r.test(uri);
    }
    function getQueryParameter(url, name) {
        if (!url || "string" != typeof url) return null;
        if (!name || "string" != typeof name) return null;
        var uri = parseUri(url);
        if (!uri.query) return null;
        var f = Object.keys(uri.queryKey).filter(function(key) {
            return key.toLowerCase() == name;
        });
        return 1 === f.length ? uri.queryKey[f[0]] : null;
    }
    function splitEscaped(str, delimiter) {
        if (null === str || void 0 === str) return [];
        if (!delimiter) return [ str ];
        if ("\\" == delimiter) throw new Error("\\ delimiter is not supported");
        if (delimiter.length > 1) throw new Error("delimiter should be single character");
        for (var res = [], part = "", escaped = !1, i = 0; i < str.length; ) {
            var current = str.charAt(i);
            escaped ? (part += current, escaped = !1) : "\\" == current ? escaped = !0 : current == delimiter ? (res.push(part), 
            part = "") : part += current, i++;
        }
        return res.push(part), res;
    }
    function getDpi() {
        var e = document.body.appendChild(document.createElement("DIV"));
        e.style.width = "1in", e.style.padding = "0";
        var dpi = e.offsetWidth;
        return e.parentNode.removeChild(e), dpi;
    }
    function resolveErrorMessage(args, resourceManager) {
        var xhr = args[0];
        if (3 == args.length && xhr.status) {
            if (resourceManager && 404 == xhr.status) return resourceManager("error.NotFound");
            if (xhr.responseJSON && xhr.responseJSON.Message) return xhr.responseJSON.Message;
            if (xhr.responseJSON && xhr.responseJSON.Error) return xhr.responseJSON.Error;
            if (xhr.responseText) {
                var m = /<title>([^<]*)<\/title>/.exec(xhr.responseText);
                if (m) return m[1];
            }
            return xhr.statusText;
        }
        return xhr.statusText ? xhr.statusText : xhr;
    }
    function getTextElements(page, removeTextChilds) {
        var topLevelSelector = "div, p, td, li, span", pageObject = page instanceof jQuery ? page : $("<div/>").html(page), elements = pageObject.find(topLevelSelector);
        return removeTextChilds ? jQuery.map(elements, function(topLevelElement) {
            return $($(topLevelElement).clone().find(topLevelSelector).remove().end());
        }) : elements;
    }
    function DocumentModel(reportService, token, reportType) {
        function _resolveActionItems(element) {
            return _actionItemsResolver.resolve(element, _reportType);
        }
        function getToc() {
            if (!reportService) return $.Deferred().resolve(emptyToc).promise();
            var result = $.Deferred();
            return _toc() === nullToc || _toc() == emptyToc ? reportService.getToc(token).done(result.resolve).fail(failHandler) : result.resolve(_toc()), 
            result.promise();
        }
        function load() {
            _pageCount(0), _state(DocumentState.progress), reportService.getPageCount(token).progress(function(count) {
                _pageCount(count);
            }).done(function(count) {
                _pageCount(count), _state(DocumentState.completed);
            }).fail(setErrorState).fail(failHandler);
        }
        function setErrorState() {
            _state(DocumentState.error);
        }
        function failHandler() {
            var error = resolveErrorMessage(arguments);
            $(doc).trigger("error", error);
        }
        function getPage(index) {
            return !token || 0 > index || index >= _pageCount() ? $.Deferred().resolve("").promise() : reportService.getPage(token, index).fail(failHandler);
        }
        function exportImpl(exportType, settings) {
            if (!token || _pageCount() <= 0) throw new Error("document is not ready for export");
            return reportService["export"](token, exportType, settings).fail(failHandler);
        }
        var nullToc = {
            kids: []
        }, emptyToc = {
            kids: []
        }, _pageCount = ko.observable(0), _state = ko.observable(DocumentState.init), _toc = ko.observable(nullToc), _reportType = reportType, _actionItemsResolver = new ActionItemsResolver(), _search = reportService && reportService.search && reportService.search.apply ? function(searchOptions) {
            return reportService.search(token, searchOptions);
        } : function(searchService) {
            return function(searchOptions) {
                return searchService.search(doc, searchOptions);
            };
        }(new ClientSideSearchService()), doc = {
            get pageCount() {
                return _pageCount;
            },
            get state() {
                return _state;
            },
            getPage: getPage,
            getToc: getToc,
            get toc() {
                return reportService ? (_toc() === nullToc && (_toc(emptyToc), ko.waitFor(_state, function(state) {
                    return state == DocumentState.completed;
                }, function() {
                    return getToc().done(_toc);
                })), _toc) : _toc;
            },
            "export": exportImpl,
            search: _search,
            resolveActionItems: _resolveActionItems
        };
        return reportService && token && load(), doc;
    }
    function DocumentViewModel(viewer) {
        var _pageContent = ko.promise(function() {
            return this.document().getPage(this.pageIndex());
        }, viewer), _inProgress = ko.computed(function() {
            return viewer.report().busy();
        }), _parameterValidation = ko.computed(function() {
            return viewer.report().parameterValidation();
        });
        return {
            get pageContent() {
                return _pageContent;
            },
            get location() {
                return viewer.location;
            },
            get inProgress() {
                return _inProgress;
            },
            get parameterValidation() {
                return _parameterValidation;
            }
        };
    }
    function Enum() {}
    function ErrorPaneViewModel(viewer) {
        var _showErrorsPane = ko.computed(function() {
            return viewer.errors().length > 0;
        }), _showExtendedErrorInfo = ko.observable(!1), _lastError = ko.computed(function() {
            var nerr = viewer.errors().length;
            return nerr > 0 ? viewer.errors()[nerr - 1] : "";
        });
        return _showErrorsPane.subscribe(function(newValue) {
            newValue || _showExtendedErrorInfo(!1);
        }), {
            get visible() {
                return _showErrorsPane;
            },
            get lastError() {
                return _lastError;
            },
            get showErrorInfo() {
                return _showExtendedErrorInfo;
            },
            get errors() {
                return viewer.errors;
            },
            get showOnlyLastError() {
                return viewer.showOnlyLastError;
            },
            dismissErrors: function() {
                _showExtendedErrorInfo(!1), viewer.clearErrors();
            }
        };
    }
    function InteractivityProcessor(services) {
        function processActions(pageContent) {
            for (var count = onPageProcessed.length; onPageProcessed.length > 0; ) {
                var handler = onPageProcessed.pop();
                $.isFunction(handler) && handler(pageContent);
            }
            return count - onPageProcessed.length;
        }
        function processActionItem(actionItem, pageContent) {
            function pageBookmarkCustomHandler(item) {
                onPageProcessed.push(function(content) {
                    var elementToScroll = $(content).find("#" + item.target).first();
                    if (null !== elementToScroll) {
                        var viewerOffset = $(content).offset(), elementOffset = $(elementToScroll).offset(), elementToViewerOffset = {
                            top: elementOffset.top - viewerOffset.top,
                            left: elementOffset.left - viewerOffset.left
                        };
                        viewer.location(elementToViewerOffset);
                    }
                }), viewer.pageIndex() == item.pageNumber - 1 ? processActions(pageContent) : viewer.pageIndex(item.pageNumber - 1);
            }
            function sectionBookmarkCustomHandler(item) {
                function traverseTocTree(node, path, originalPromise) {
                    function traverseKids(kids, kidLabel, restPath) {
                        for (var i = 0; i < kids.length; i++) {
                            var kid = kids[i];
                            if (kid.name === kidLabel) return restPath.length > 0 ? traverseTocTree(kid, restPath, d) : d.resolve(kid);
                        }
                        return null;
                    }
                    var d = null === originalPromise || void 0 === originalPromise ? $.Deferred() : originalPromise;
                    if (null === node || void 0 === node) return d.resolve(null);
                    var label = path[0];
                    return void 0 !== node.name && node.name === label ? d.resolve(node) : (void 0 !== node.kids && (ko.isObservable(node.kids) ? ko.waitFor(node.kids, function(k) {
                        return k.length > 0;
                    }, function(newKids) {
                        traverseKids(newKids, label, path.slice(1, path.length));
                    }) : traverseKids(node.kids, label, path.slice(1, path.length))), d.promise());
                }
                traverseTocTree(tocPane.root(), item.label.split("\\")).done(function(node) {
                    null !== node && tocPane.navigate(node);
                });
            }
            function getClickHandler(item) {
                return function() {
                    var actionHandler = services.action;
                    if (jQuery.isFunction(actionHandler) && !actionHandler(item.actionType, item)) return !1;
                    switch (item.actionType) {
                      case ActionType.hyperlink:
                        window.open(item.url, "_blank");
                        break;

                      case ActionType.bookmark:
                        item.reportType === ReportType.pageReport ? pageBookmarkCustomHandler(item) : item.reportType === ReportType.sectionReport && sectionBookmarkCustomHandler(item);
                        break;

                      case ActionType.drillthrough:
                        viewer.drillthrough(item.drillthroughLink);
                        break;

                      case ActionType.toggle:
                        viewer.toggle(item.toggleInfo);
                    }
                    return !1;
                };
            }
            var itemElement = $(actionItem.element);
            itemElement.click(getClickHandler(actionItem));
        }
        var viewer = services.viewer, tocPane = services.tocPane, onPageProcessed = [];
        return {
            processActions: processActions,
            processActionItem: processActionItem
        };
    }
    function ParameterModel(p) {
        function isNullable() {
            return _nullable;
        }
        function getValue() {
            return _state == ParameterState.HasOutstandingDependencies ? null : null !== _value && void 0 !== _value ? _value : getValues() && getValues()[0] ? getValues()[0].value : null;
        }
        function setValue(newValue) {
            _value = newValue, _values = null, updateState();
        }
        function updateState() {
            isNullable() || null !== getValue() && void 0 !== getValue() || (_state = ParameterState.ExpectValue);
        }
        function getValues() {
            return _state == ParameterState.HasOutstandingDependencies ? [] : _values;
        }
        function setValues(newValues) {
            _values = newValues, _value = null, updateState();
        }
        var _nullable = p.nullable, _value = p.value, _state = p.state, _values = p.values, _name = p.name, _hidden = p.hidden, _availableValues = p.availableValues, _prompt = p.prompt, _multiline = p.multiline, _multivalue = p.multivalue, _allowEmpty = p.allowEmpty, _dateOnly = p.dateOnly, _type = p.type, _promptUser = p.promptUser, _definesValidValues = p.definesValidValues, _selectAllEnabled = p.selectAllEnabled, _dateDomain = p.dateDomain, _error = p.error, _editor = p.editor, _dependantParameterNames = p.dependantParameterNames, _hasDependantParameters = p.hasDependantParameters;
        return {
            updateState: updateState,
            get name() {
                return _name;
            },
            get hidden() {
                return _hidden;
            },
            get value() {
                return getValue();
            },
            set value(newValue) {
                setValue(newValue);
            },
            get values() {
                return getValues();
            },
            set values(newValues) {
                setValues(newValues);
            },
            get availableValues() {
                return _availableValues;
            },
            get prompt() {
                return _prompt;
            },
            get nullable() {
                return isNullable();
            },
            get multiline() {
                return _multiline;
            },
            get multivalue() {
                return _multivalue;
            },
            get allowEmpty() {
                return _allowEmpty;
            },
            get dateOnly() {
                return _dateOnly;
            },
            get type() {
                return _type;
            },
            get state() {
                return _state;
            },
            get promptUser() {
                return _promptUser;
            },
            get definesValidValues() {
                return _definesValidValues;
            },
            get selectAllEnabled() {
                return _selectAllEnabled;
            },
            get dateDomain() {
                return _dateDomain;
            },
            get error() {
                return _error;
            },
            get editor() {
                return _editor;
            },
            get dependantParameterNames() {
                return _dependantParameterNames;
            },
            get hasDependantParameters() {
                return (this.dependantParameterNames ? this.dependantParameterNames.length > 0 : !1) || !!_hasDependantParameters;
            },
            setClientValidationFailed: function(message) {
                _state = ParameterState.ClientValidationFailed, _error = message;
            },
            setOk: function() {
                _state = ParameterState.Ok, _error = "";
            }
        };
    }
    function ParameterPaneViewModel(services, viewer) {
        function runReport() {
            refreshAfterValidation = !1, viewer.report().run();
        }
        function refreshReport() {
            validating ? refreshAfterValidation = !0 : runReport();
        }
        if (!viewer) throw new ReferenceError("viewer is required here!");
        var _allViewsValid = ko.observable(!0), parameterViewModels = ko.observable([]), areAllParametersValid = ko.computed(function() {
            return viewer.report().allParametersValid() && _allViewsValid();
        }), parameterPaneVisible = ko.computed({
            read: function() {
                return viewer.sidebarState() === SidebarState.Parameters;
            },
            write: function(value) {
                viewer.sidebarState(value ? SidebarState.Parameters : SidebarState.Hidden);
            }
        });
        viewer.report.subscribe(function() {
            parameterViewModels([]);
        });
        var validating = !1, refreshAfterValidation = !1;
        ko.computed(function() {
            return viewer.report().parameters();
        }).subscribe(function(params) {
            function updateIsValid(_) {
                _allViewsValid(parameterViewModels().every(function(v) {
                    return 0 === v.errorText().length;
                }));
            }
            function parameterChanged(p) {
                validating = !0, viewer.report().validateParameter({
                    multivalue: p.multivalue,
                    name: p.name,
                    value: p.value,
                    values: p.values
                }).done(function() {
                    areAllParametersValid() && refreshAfterValidation && runReport();
                }).always(function() {
                    validating = !1;
                });
            }
            if (0 === parameterViewModels().length) {
                var paramModels = params.filter(function(p) {
                    return void 0 === p.promptUser || p.promptUser;
                }).map(function(p) {
                    return ParameterViewModel(services, p, parameterChanged, updateIsValid, viewer.report());
                });
                parameterViewModels(paramModels);
            } else parameterViewModels().forEach(function(paramModel) {
                var updated = params.filter(function(pp) {
                    return pp.name == paramModel.name;
                });
                1 == updated.length && paramModel.$update(updated[0]);
            });
        });
        var _canRefresh = ko.computed(function() {
            return areAllParametersValid() && !viewer.report().parameterValidation();
        });
        return {
            visible: parameterPaneVisible,
            isValid: areAllParametersValid,
            refreshReport: {
                exec: refreshReport,
                enabled: _canRefresh
            },
            refreshReportAndClose: {
                exec: function() {
                    viewer.sidebarState(SidebarState.Hidden), refreshReport();
                },
                enabled: _canRefresh
            },
            parameters: parameterViewModels
        };
    }
    function ParameterViewModel(services, param, parameterChanged, parameterUpdateIsValid, reportModel) {
        function equals(v1, v2) {
            return _parameterModel.type === ParameterType.DateTime ? v1 - v2 === 0 : v1 === v2;
        }
        function updateEnabled() {
            _enabled(_parameterModel.state != ParameterState.HasOutstandingDependencies && !reportModel.parameterValidation());
        }
        function updateParameter(p) {
            function createOptionViewModel(availableValue) {
                var option = ParameterOptionViewModel(availableValue);
                return option.selected.subscribe(function() {
                    onSelectedChanged(option);
                }), option;
            }
            if (_parameterModel = p, _value(p.value), _isValueNull(_parameterModel.nullable && null === p.value), 
            updateEnabled(), _editor(p.editor), _values(p.values), p.multivalue && p.state != ParameterState.HasOutstandingDependencies && (p.setOk(), 
            p.updateState()), _errorText(function(state, error) {
                var errorText = "";
                switch (state) {
                  case ParameterState.Ok:
                    return "";

                  case ParameterState.ExpectValue:
                    errorText = getResourceString("error.ExpectValue");
                    break;

                  case ParameterState.ValidationFailed:
                    errorText = getResourceString("error.ValidationFailed");
                    break;

                  case ParameterState.HasOutstandingDependencies:
                    return getResourceString("error.HasOutstandingDependencies");

                  case ParameterState.ClientValidationFailed:
                    return error;
                }
                return [ errorText, error ].filter(identity).join(": ");
            }(p.state, p.error)), "" !== _errorText() || _parameterModel.nullable || null !== _value() || _errorText(getResourceString("error.ExpectValue")), 
            p.availableValues) {
                var optionModels = p.availableValues.map(function(av) {
                    var selected = _parameterModel.multivalue ? p.values.some(function(v) {
                        return equals(v.value, av.value);
                    }) : equals(av.value, p.value);
                    return createOptionViewModel({
                        value: av.value,
                        label: av.label,
                        selected: selected
                    });
                });
                if (_parameterModel.nullable && !_parameterModel.multivalue) {
                    var nullLabel = getResourceString("null");
                    optionModels.push(createOptionViewModel({
                        value: null,
                        label: nullLabel,
                        selected: _isValueNull()
                    }));
                }
                if (_parameterModel.selectAllEnabled) {
                    var label = getResourceString("selectAll");
                    optionModels.splice(0, 0, createOptionViewModel({
                        value: ParameterSpecialValue.SelectAll,
                        label: label,
                        selected: p.value === ParameterSpecialValue.SelectAll
                    }));
                }
                _options(optionModels), updateEnabled();
            }
        }
        function isValidDate(d) {
            return Date.isDate(d);
        }
        function convertToTyped(value, type) {
            if (null === value) return null;
            switch (type) {
              case ParameterType.Bool:
                if ("boolean" == typeof value) return value;
                if ("true" == value.toLowerCase()) return !0;
                if ("false" == value.toLowerCase()) return !1;
                throw new Error(getResourceString("error.ExpectBooleanValue"));

              case ParameterType.Int:
                if (value = parseInt(value, 10), isNaN(value)) throw new Error(getResourceString("error.ExpectNumericValue"));
                break;

              case ParameterType.Float:
                if ("" === value) return null;
                value.replace && (value = value.replace(",", "."));
                var notFiniteNumber = isNaN(value) || parseFloat(value) == 1 / 0 || parseFloat(value) == -(1 / 0);
                if (notFiniteNumber) throw new Error(getResourceString("error.ExpectNumericValue"));
                value = parseFloat(value);
                break;

              case ParameterType.DateTime:
                if (value = checkDateFormatYearOnly(value) ? new Date(parseInt(value), 0, 1) : checkDateFormat(value) ? new Date(value.replace(/-/g, "/").replace(/T/g, " ")) : new Date(value), 
                !isValidDate(value)) throw new Error(getResourceString("error.ExpectDateValue"));
                break;

              default:
                value = value.toString();
            }
            return value;
        }
        function updateValue(newValue) {
            if (_isValueNull(_parameterModel.nullable && null === newValue), !(_parameterModel.type == ParameterType.DateTime & (checkDateFormatYearOnly(newValue) | checkDateFormat(newValue)) & !checkYear(newValue))) {
                try {
                    ParameterSpecialValue.notContains(newValue) && (newValue = convertToTyped(newValue, _parameterModel.type)), 
                    _parameterModel.setOk();
                } catch (e) {
                    _parameterModel.setClientValidationFailed(e.message);
                }
                _value(newValue), parameterChanged({
                    name: _parameterModel.name,
                    value: newValue
                });
            }
        }
        function updateValues(newValues) {
            try {
                newValues = newValues.map(function(value) {
                    var resultValue = value.value;
                    return ParameterSpecialValue.notContains(resultValue) && (resultValue = convertToTyped(resultValue, _parameterModel.type)), 
                    {
                        label: value.label,
                        value: resultValue
                    };
                }), _parameterModel.setOk();
            } catch (e) {
                _parameterModel.setClientValidationFailed(e.message);
            }
            _values(newValues), parameterChanged({
                multivalue: !0,
                name: _parameterModel.name,
                values: newValues,
                value: null
            });
        }
        function onSelectedChanged(option) {
            option.selected() && (option.value == ParameterSpecialValue.SelectAll ? _options().filter(function(o) {
                return o != option;
            }).forEach(function(o) {
                o.selected(!1);
            }) : _parameterModel.selectAllEnabled && _options().filter(function(o) {
                return o.value == ParameterSpecialValue.SelectAll;
            }).forEach(function(o) {
                o.selected(!1);
            }));
        }
        function checkDateFormat(value) {
            return null !== value ? /^[\d]{4}-[\d]{2}(-[\d]{2})?((T| )[\d]{2}:[\d]{2}(:[\d]{2})?)?$/.test(value) : !1;
        }
        function checkDateFormatYearOnly(value) {
            return null !== value ? /^[\d]{4}$/.test(value) : !1;
        }
        function checkYear(value) {
            if (null !== value) {
                var year = value.toString().split("-")[0];
                return year > 1e3 && 1e4 > year;
            }
            return !1;
        }
        var _parameterModel = param, _value = ko.observable(null), _isValueNull = ko.observable(!1), _enabled = ko.observable(!1), _errorText = ko.observable(""), _options = ko.observable([]), _values = ko.observable([]), _editor = ko.observable(ParameterEditorType.SingleValue), getResourceString = services.resourceManager && services.resourceManager.get || identity;
        reportModel.parameterValidation.subscribe(function() {
            updateEnabled();
        }), _errorText.subscribe(function(v) {
            parameterUpdateIsValid(0 === v.length);
        });
        var _dateTimePickerSuported, _isValueNullProperty = ko.computed({
            read: _isValueNull,
            write: function(v) {
                v ? updateValue(null) : _isValueNull(!1);
            }
        }), _valueProperty = ko.computed({
            read: _value,
            write: updateValue
        }), _stringValueProperty = ko.computed({
            read: function() {
                function toDateString(dt) {
                    return _parameterModel.dateOnly ? dt.toLocaleDateString() : dt.toLocaleString();
                }
                return _editor() == ParameterEditorType.MultiValue ? _values().map(function(v) {
                    return v.label;
                }).join(", ") : _editor() == ParameterEditorType.SelectOneFromMany ? _options().filter(function(o) {
                    return equals(o.value, _value());
                }).map(function(v) {
                    return v.label;
                }).join(", ") : null === _value() || void 0 === _value() ? "" : _parameterModel.type === ParameterType.DateTime && _value() instanceof Date ? toDateString(_value()) : _value().toString();
            },
            write: updateValue
        }), _isDateTimePickedSupported = function() {
            if (void 0 === _dateTimePickerSuported) {
                var element = document.createElement("input");
                element.setAttribute("type", "datetime-local"), _dateTimePickerSuported = "datetime-local" === element.type;
            }
            return _dateTimePickerSuported;
        }, _datePickerValueProperty = ko.computed({
            read: function() {
                function toDateString(dt) {
                    function pad(v) {
                        return ("0" + v).right(2);
                    }
                    var dateTimeDelimiter = _isDateTimePickedSupported() ? "T" : " ", dateString = dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
                    return _parameterModel.dateOnly ? dateString : dateString + dateTimeDelimiter + pad(dt.getHours()) + ":" + pad(dt.getMinutes()) + ":" + pad(dt.getSeconds());
                }
                return null !== _value() && void 0 !== _value() && _parameterModel.type === ParameterType.DateTime && _value() instanceof Date ? toDateString(_value()) : "";
            },
            write: updateValue
        }), _displayValueProperty = ko.computed({
            read: function() {
                return _parameterModel.nullable ? null === _value() ? getResourceString("null") : _stringValueProperty() : null === _value() || void 0 === _value() ? getResourceString("enterValue") : _stringValueProperty();
            }
        });
        return updateParameter(_parameterModel), {
            get prompt() {
                return _parameterModel.prompt;
            },
            get nullable() {
                return _parameterModel.nullable;
            },
            get type() {
                return _parameterModel.type;
            },
            get name() {
                return _parameterModel.name;
            },
            get editor() {
                return _editor;
            },
            get dateOnly() {
                return _parameterModel.dateOnly;
            },
            get enabled() {
                return _enabled;
            },
            get isValueNull() {
                return _isValueNullProperty;
            },
            get errorText() {
                return _errorText;
            },
            get value() {
                return _valueProperty;
            },
            get stringValue() {
                return _stringValueProperty;
            },
            get datePickerValue() {
                return _datePickerValueProperty;
            },
            get displayValue() {
                return _displayValueProperty;
            },
            get options() {
                return _options;
            },
            clearOptions: function() {
                _options().forEach(function(o) {
                    o.selected(!1);
                }), updateValues([]);
            },
            $update: updateParameter,
            $updateValuesFromModel: function(ok) {
                if (_parameterModel.multivalue && ok) {
                    var values = _options().filter(function(v) {
                        return v.selected();
                    }).map(function(v) {
                        return {
                            value: v.value,
                            label: v.label
                        };
                    });
                    updateValues(values);
                }
            }
        };
    }
    function ParameterOptionViewModel(availableValue) {
        var _selected = ko.observable(!!availableValue.selected);
        return {
            get label() {
                return availableValue.label || String(availableValue.value);
            },
            get value() {
                return availableValue.value;
            },
            get selected() {
                return _selected;
            }
        };
    }
    function PrintingService() {
        function printPdf(documentModel) {
            return documentModel["export"](ExportType.Pdf, {
                printing: !0
            }).done(function(uri) {
                var $iframe = $("#" + printingFrameId);
                0 === $iframe.length && ($iframe = $("<iframe/>"), $iframe.attr("id", printingFrameId), 
                $iframe.css({
                    width: "1px",
                    height: "1px",
                    display: "none",
                    position: "fixed",
                    left: "0",
                    right: "0"
                }), $("body").append($iframe)), $iframe.attr("src", uri);
            });
        }
        var printingFrameId = "gc-viewer-print-frame";
        return {
            print: function(documentModel) {
                return printPdf(documentModel);
            }
        };
    }
    function convertPropertiesToJson(input) {
        function unescape(s) {
            return s = s.replace(/\\u(\d+)/g, function(match, ns) {
                return String.fromCharCode(parseInt(ns, 10));
            }), s = s.replace(/\\(.)/g, "all.js"), s.endsWith("\\") && (s = s.substr(0, s.length - 1)), 
            s;
        }
        function parse(s) {
            var m = s.match(/((\\.|[^:=])+)[:=](.*)/);
            return m ? {
                key: unescape(m[1].trim()),
                value: unescape(m[3].trim())
            } : null;
        }
        if ("string" != typeof input || !input) return {};
        for (var lines = input.split(/\r?\n/g), output = {}, i = 0; i < lines.length; i++) {
            var l = lines[i].trim();
            if (l && !l.startsWith("#") && !l.startsWith("!")) {
                var p = parse(l);
                if (p) {
                    for (;l.endsWith("\\") && i + 1 < lines.length; ) l = lines[++i].trim(), p.value += unescape(l);
                    output[p.key] = p.value;
                }
            }
        }
        return output;
    }
    function ReportModel(reportService, reportInfo, busy, resourceManager) {
        function dispose(async) {
            if (_disposed = !0, _reportToken) {
                var token = _reportToken;
                _reportToken = null, _reportType = ReportType.unknown, _params([]), _state(ReportModelState.closed), 
                reportService.close(token, async);
            }
        }
        function open() {
            reportInfo.id && (_reportToken = null, _reportType = ReportType.unknown, _busy(!0), 
            reportService.open(reportInfo.id, reportInfo.parameters || []).done(function(rpt) {
                _reportToken = rpt.token, _reportType = rpt.reportType, _autoRun(!!rpt.autoRun), 
                _params(rpt.parameters.map(function(serviceParameter) {
                    return ParameterModel(serviceParameter);
                }) || []), keepAlive(), _state(ReportModelState.open), rpt.autoRun && _allParametersValid() && run(), 
                _disposed && dispose(!0);
            }).fail(failHandler).always(function() {
                _autoRun() || _busy(!1), _allParametersValid() || _busy(!1);
            }));
        }
        function keepAlive() {
            _reportToken && reportService.ping(_reportToken).done(function(shouldContinue) {
                shouldContinue && setTimeout(function() {
                    keepAlive();
                }, pingTimeout);
            });
        }
        function failHandler() {
            var error = resolveErrorMessage(arguments, SR);
            _busy(!1), _state(ReportModelState.error), raiseError(error);
        }
        function raiseError(error) {
            $report.trigger("error", error);
        }
        function subscribeFirstPageLoaded(docModel) {
            docModel && (ko.waitFor(docModel.pageCount, function(pageCount) {
                return pageCount > 0;
            }, function() {
                _busy(!1);
            }), ko.waitFor(docModel.state, function(state) {
                return state == DocumentState.completed;
            }, function() {
                _busy(!1);
            }));
        }
        function run() {
            if (!_reportToken) throw new Error("Report is not opened!");
            if (!_allParametersValid()) throw new Error("Invalid parameters!");
            return validateParameters(_params()).done(function() {
                var allParametersOk = _params().every(function(p) {
                    return p.state == ParameterState.Ok;
                });
                return allParametersOk ? (_busy(!0), reportService.run(_reportToken, _params()).then(function(d) {
                    _state(ReportModelState.documentReady);
                    var dm = DocumentModel(reportService, d, _reportType);
                    subscribeFirstPageLoaded(dm), $report.trigger("documentReady", dm);
                }).fail(failHandler)) : $.Deferred().resolve();
            });
        }
        function validateParameters(parameters, dependantNames) {
            return parameters && parameters.length > 0 ? (_parameterValidation(!0), reportService.validateParameters(_reportToken, parameters, dependantNames).then(function(newParameters) {
                _params(newParameters.map(function(serviceParameter) {
                    return ParameterModel(serviceParameter);
                }));
            }).fail(raiseError).always(function() {
                _parameterValidation(!1);
            })) : $.Deferred().resolve();
        }
        function validateParameter(parameter) {
            var parameterFromModel = _params().filter(function(p) {
                return p.name == parameter.name;
            })[0];
            if (parameterFromModel.hasDependantParameters) {
                if (reportService.validateParameterSupported()) return reportService.validateParameter(_reportToken, parameter).then(function(updated) {
                    var newParameters = _params().map(function(parameterModel) {
                        var f = updated.filter(function(u) {
                            return u.name == parameterModel.name;
                        });
                        return 1 == f.length ? ParameterModel(f[0]) : parameterModel;
                    });
                    _params(newParameters);
                }).fail(raiseError);
                var parameters = _params().map(function(p) {
                    return p.name == parameter.name ? parameter : p;
                });
                return validateParameters(parameters, parameterFromModel.dependantParameterNames);
            }
            return parameter.multivalue ? parameterFromModel.values = parameter.values : parameterFromModel.value = parameter.value, 
            _params(_params()), $.Deferred().resolve();
        }
        function drillthrough(drillthroughLink) {
            return _busy(!0), reportService.drillthrough(_reportToken, drillthroughLink).then(function(result) {
                var parameterModels = result.parameters.map(function(serviceParameter) {
                    var parameterModel = ParameterModel(serviceParameter);
                    return parameterModel.setOk(), parameterModel.updateState(), parameterModel;
                }) || [], child = ReportModel(reportService, {
                    token: result.reportToken,
                    parameters: parameterModels,
                    docToken: result.documentToken,
                    reportType: ReportType.pageReport
                }, !0);
                child.keepAlive();
                var dm = result.documentToken ? DocumentModel(reportService, result.documentToken, ReportType.pageReport) : null;
                return child.subscribeFirstPageLoaded(dm), {
                    report: child,
                    document: dm
                };
            }).fail(raiseError).always(function() {
                _busy(!1);
            });
        }
        function toggle(toggleInfo) {
            return _busy(!0), reportService.toggle(_reportToken, toggleInfo).then(function(info) {
                return _state(ReportModelState.documentReady), $report.trigger("documentReady", DocumentModel(reportService, info.url, _reportType)), 
                info;
            }).fail(raiseError).always(function() {
                _busy(!1);
            });
        }
        if (!reportService) throw new ReferenceError("ReportService is required here!");
        reportInfo = reportInfo || {};
        var pingTimeout = 6e4, SR = resourceManager && $.isFunction(resourceManager.get) ? resourceManager.get : identity, _busy = ko.observable(void 0 === busy ? !1 : busy), _parameterValidation = ko.observable(!1), _state = ko.observable(ReportModelState.noReport), _autoRun = ko.observable(!1), _reportToken = null, _params = ko.observable([]), _allParametersValid = ko.computed(function() {
            var parameters = _params();
            return parameters.every(function(p) {
                return p.state == ParameterState.Ok;
            });
        }), _hasPromptParams = ko.computed(function() {
            var parameters = _params();
            return parameters.filter(function(p) {
                return void 0 === p.promptUser || p.promptUser;
            }).length > 0;
        }), _reportType = ReportType.unknown, _disposed = !1, report = {
            get state() {
                return _state;
            },
            get busy() {
                return _busy;
            },
            get parameterValidation() {
                return _parameterValidation;
            },
            get parameters() {
                return _params;
            },
            get hasPromptParameters() {
                return _hasPromptParams;
            },
            get allParametersValid() {
                return _allParametersValid;
            },
            validateParameter: validateParameter,
            subscribeFirstPageLoaded: subscribeFirstPageLoaded,
            open: open,
            run: run,
            dispose: dispose,
            drillthrough: drillthrough,
            toggle: toggle,
            keepAlive: keepAlive,
            get autoRun() {
                return _autoRun;
            }
        }, $report = $(report);
        return reportInfo.id ? (_reportToken = null, _params([]), _reportType = ReportType.unknown, 
        _state(ReportModelState.noReport)) : reportInfo.token && (_reportToken = reportInfo.token, 
        _reportType = reportInfo.reportType, _params(reportInfo.parameters.map(function(parameter) {
            return ParameterModel(parameter);
        })), _state(reportInfo.docToken ? ReportModelState.documentReady : ReportModelState.open)), 
        report;
    }
    function ReportServiceBase(service, serviceUrl, setSecurityToken) {
        function isUndefined(value) {
            return void 0 === value || null === value;
        }
        function setAuthToken(ajaxOptions) {
            return setSecurityToken && setSecurityToken(ajaxOptions), ajaxOptions;
        }
        function postService(url, data, skipError, async) {
            return postJson(url, data, skipError, async).then(function(msg) {
                return isUndefined(msg.d) ? invalidResponse(msg) : isUndefined(msg.d.Error) ? msg.d : skipError ? msg.d : errorPromise(msg.d.Error.Description || "ReportService fail!");
            }).fail(function() {
                var error = resolveErrorMessage(arguments);
                $(service).trigger("error", error);
            });
        }
        function postJson(url, data, skipError, async) {
            return isAbsoluteUri(url) || (url = serviceUrl + url), isUndefined(async) && (async = !0), 
            $.ajax(setAuthToken({
                type: "POST",
                url: url,
                data: JSON.stringify(data),
                contentType: "application/json",
                async: async
            }));
        }
        function get(url) {
            return isAbsoluteUri(url) || (url = serviceUrl + url), $.ajax(setAuthToken({
                type: "GET",
                url: url
            })).then(function(data, status, xhr) {
                return $.Deferred(function(d) {
                    d.resolve(data, status, xhr);
                });
            }, failCallback);
        }
        function getJson(url) {
            return isAbsoluteUri(url) || (url = serviceUrl + url), $.ajax(setAuthToken({
                type: "GET",
                url: url,
                dataType: "json"
            })).then(function(data, status, xhr) {
                return $.Deferred(function(d) {
                    d.resolve(data, status, xhr);
                });
            }, failCallback);
        }
        function failCallback(error) {
            return 3 == arguments.length && arguments[0] && arguments[0].status && (error = getXhrErrorMessage(arguments[0])), 
            error;
        }
        function getXhrErrorMessage(xhr) {
            var responseJson = xhr.responseJSON;
            if (!responseJson && xhr.responseText) try {
                responseJson = JSON.parse(xhr.responseText);
            } catch (e) {}
            return responseJson && responseJson.Message ? responseJson.Message : xhr.statusText;
        }
        function errorPromise(problem) {
            return $.Deferred(function(deferred) {
                deferred.reject(problem);
            }).promise();
        }
        function invalidResponse(value) {
            return errorPromise("Invalid response: " + JSON.stringify(value));
        }
        return {
            post: postService,
            postRest: postJson,
            get: get,
            getJson: getJson,
            errorPromise: errorPromise,
            invalidResponse: invalidResponse,
            invalidArg: function(name, value) {
                return errorPromise("Invalid argument {0}. Value: {1}".format(name, JSON.stringify(value)));
            },
            promise: function(value) {
                return $.Deferred(function(d) {
                    d.resolve(value);
                }).promise();
            },
            delay: function(promiseFn, timeout) {
                var def = $.Deferred();
                return setTimeout(function() {
                    promiseFn().done(function() {
                        def.resolve.apply(def, arguments);
                    }).fail(function() {
                        def.reject.apply(def, arguments);
                    });
                }, timeout), def.promise();
            }
        };
    }
    function ReportServiceSelector(options, resourceManager) {
        function realService() {
            return impl || (impl = options.securityToken ? ArsReportService(options, resourceManager) : ArReportService(options, resourceManager)), 
            impl;
        }
        function delegate(method) {
            return function() {
                var args = arguments, service = realService();
                return service[method].apply(service, args);
            };
        }
        if (!options.url) throw new Error("options has no valid url");
        var impl, api = {};
        return [ "open", "close", "run", "validateParameters", "validateParameter", "getPageCount", "getPage", "getToc", "export", "search", "drillthrough", "toggle", "ping" ].forEach(function(method) {
            "function" == typeof realService()[method] && (api[method] = delegate(method));
        }), api.validateParameterSupported = function() {
            return impl && impl.validateParameterSupported();
        }, api;
    }
    function ResourceManager() {
        var embedded = {}, resources = {};
        embedded = {
            sidebar: "Sidebar",
            toc: "TOC",
            tocfull: "Table of Contents",
            firstPage: "First",
            lastPage: "Last",
            prevPage: "Prev",
            nextPage: "Next",
            print: "Print",
            backToParent: "Back to Parent",
            params: "Parameters",
            saveas: "Save As...",
            pdfDocument: "PDF Document",
            wordDocument: "Word Document",
            imageFile: "Image File",
            mhtDocument: "MHTML Web Archives",
            excelWorkbook: "Excel Workbook",
            yes: "Yes",
            no: "No",
            "true": "True",
            "false": "False",
            "null": "Null",
            "null-label": "Null value",
            on: "On",
            off: "Off",
            selectAll: "(select all)",
            enterValue: "Enter value",
            clearAllOptions: "Reset all",
            blank: "Blank",
            empty: "Empty",
            back: "Back",
            refreshReport: "View report",
            search: "Search",
            matchCase: "Match case",
            wholePhrase: "Whole phrase",
            more: "More...",
            noResults: "No results",
            clear: "Clear",
            findLabel: "Find:",
            "errorPane.Details": "Show details",
            "errorPane.HideDetails": "Hide details",
            "errorPane.DismissAll": "Dismiss all",
            "errorPane.ErrorPaneTitle": "An error(s) occured",
            "error.ExpectValue": "Value expected",
            "error.ValidationFailed": "Validation failed",
            "error.HasOutstandingDependencies": "Has outstanding dependencies.",
            "error.ExpectNumericValue": "Not a numeric value",
            "error.ExpectBooleanValue": "Not a boolean value",
            "error.ExpectDateValue": "Invalid date value",
            "error.NotSupported": "Operation is not supported.",
            "error.NotFound": "Not Found.",
            "error.ReportNotFound": "Unable to open report '{0}'.",
            "error.InvalidReportToken": "Invalid report token.",
            "error.InvalidDocumentToken": "Invalid document token.",
            "error.RequestFailed": "Your request failed.",
            "error.RequestRejected": "Your request was rejected.",
            "error.RequestCancelled": "Your request was cancelled.",
            "error.InvalidRequestId": "Invalid request id.",
            "error.InvalidDrillthroughLink": "Invalid drillthrough link '{0}'.",
            "error.InvalidDrillthroughParameters": "Invalid drillthrough parameters.",
            "error.InvalidResponse": "Invalid response.",
            "error.InvalidParameters": "Invalid report parameters",
            "error.DocumentNotInCache": "The document is not present in the cache. Please refresh the report.",
            "error.JsVersionsMismatch": "The version of GrapeCity.ActiveReports.Viewer.Html.js or GrapeCity.ActiveReports.Viewer.Html.min.js does not match the version of ActiveReports installed on the server side. Please update the javascript files in your application."
        };
        var manager;
        return manager = {
            get: function(key) {
                if (!key) return "";
                var value = "";
                return resources.hasOwnProperty(key) && (value = resources[key]), value || embedded[key] || "";
            },
            update: function(uri) {
                return "string" == typeof uri && uri ? $.get(uri).then(function(text) {
                    return "string" != typeof text ? !1 : (resources = convertPropertiesToJson(text), 
                    $(manager).trigger("updated"), !0);
                }) : $.Deferred(function(d) {
                    d.reject("Invalid uri.");
                }).promise();
            }
        };
    }
    function SearchPaneViewModel(viewer, maxSearchResults, pageElement) {
        function _clear() {
            _searchString(""), _matchCase(!1), _wholePhrase(!1), _reset();
        }
        function _search() {
            _lastSearchOptions = {
                text: _searchString(),
                matchCase: _matchCase(),
                wholePhrase: _wholePhrase(),
                maxSearchResults: maxSearchResults
            }, _reset(), viewer.document().search(_lastSearchOptions).done(function(res) {
                _hasMore(res.hasMore), _searchResults(res.matches), _isReady(!0);
            });
        }
        function getOffsetRect(elem) {
            var box = elem.getBoundingClientRect(), body = document.body, docElem = document.documentElement, scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop, scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft, clientTop = docElem.clientTop || body.clientTop || 0, clientLeft = docElem.clientLeft || body.clientLeft || 0, top = box.top + scrollTop - clientTop, left = box.left + scrollLeft - clientLeft;
            return {
                top: Math.round(top),
                left: Math.round(left)
            };
        }
        function _navigate(searchResult) {
            viewer.pageIndex(searchResult.page);
            var location = searchResult.location || getItemLocation(searchResult.idx, $("div.document-view", pageElement));
            viewer.location({
                left: location.left,
                top: location.top
            }), highlightSearchResult(location);
        }
        var _searchString = ko.observable(), _matchCase = ko.observable(!1), _wholePhrase = ko.observable(!1), _isReady = ko.observable(), _searchResults = ko.observableArray([]), _hasMore = ko.observable(), _searchEnabled = ko.computed(function() {
            return _searchString() && viewer.document().state() !== DocumentState.init;
        }), _lastSearchOptions = null, _found = ko.computed(function() {
            return _isReady() && _searchResults().length > 0;
        }), _highlightEnabled = ko.observable(!1), _highlightLeft = ko.observable(0), _highlightTop = ko.observable(0), _highlightWidth = ko.observable(0), _highlightHeight = ko.observable(0), _pagePadding = 5 * getDpi() / 72, _reset = function() {
            _isReady(!1), _searchResults([]), _hasMore(!1), highlightSearchResult(!1);
        };
        viewer.document.subscribe(function() {
            _clear();
        }), ko.isObservable(viewer.pageIndex) && viewer.pageIndex.subscribe(function() {
            _highlightEnabled(!1);
        });
        var getItemLocation = function(idx, pageContainer) {
            var location = {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            }, item = getTextElements(pageContainer, !1)[idx], rect = getOffsetRect(item), containerRect = getOffsetRect(pageContainer[0]);
            return rect.left && (location.left = rect.left - containerRect.left), rect.top && (location.top = rect.top - containerRect.top), 
            location.width = item.offsetWidth, location.height = item.offsetHeight, location;
        }, highlightSearchResult = function(location) {
            return location ? (_highlightLeft(_pagePadding + location.left + "px"), _highlightTop(_pagePadding + location.top + "px"), 
            _highlightWidth(location.width + "px"), _highlightHeight(location.height + "px"), 
            _highlightEnabled(!0), void 0) : void _highlightEnabled(!1);
        }, searchVisible = ko.computed({
            read: function() {
                var visible = viewer.sidebarState() === SidebarState.Search;
                return visible || highlightSearchResult(!1), visible;
            },
            write: function(value) {
                viewer.sidebarState(value ? SidebarState.Search : SidebarState.Hidden);
            }
        });
        return {
            visible: searchVisible,
            get searchString() {
                return _searchString;
            },
            get searchResults() {
                return _searchResults;
            },
            get isReady() {
                return _isReady;
            },
            get matchCase() {
                return _matchCase;
            },
            get wholePhrase() {
                return _wholePhrase;
            },
            get hasMore() {
                return _hasMore;
            },
            get found() {
                return _found;
            },
            get highlightEnabled() {
                return _highlightEnabled;
            },
            get highlightLeft() {
                return _highlightLeft;
            },
            get highlightTop() {
                return _highlightTop;
            },
            get highlightWidth() {
                return _highlightWidth;
            },
            get highlightHeight() {
                return _highlightHeight;
            },
            search: {
                exec: _search,
                enabled: _searchEnabled
            },
            keyPressHandler: function(data, event) {
                return 13 == event.keyCode && _searchEnabled() && _search(), !0;
            },
            navigate: function(searchResult) {
                _navigate(searchResult);
            },
            navigateAndClose: function(searchResult) {
                viewer.sidebarState(SidebarState.Hidden), _navigate(searchResult);
            },
            more: function() {
                _lastSearchOptions.from = _searchResults()[_searchResults().length - 1], viewer.document().search(_lastSearchOptions).done(function(res) {
                    _hasMore(res.hasMore), $.each(res.matches, function(k, v) {
                        _searchResults.push(v);
                    });
                });
            },
            clear: {
                exec: _clear
            }
        };
    }
    function Templates(baseUri, resourceManager) {
        function get(name) {
            name = name.toLowerCase();
            var template = cache[name];
            if (template) return promise(template);
            var localName = name;
            return load(name).pipe(preprocess).pipe(function(html) {
                return cache[localName] = html, html;
            });
        }
        function getSync(name) {
            var result = "";
            return get(name).done(function(html) {
                return result = html, html;
            }), result;
        }
        function load(name) {
            var template = templates[name];
            if (template) return promise(template);
            var url = templateDir + name + ".html";
            return $.ajax({
                url: url,
                async: !1,
                dataType: "text"
            });
        }
        function preprocess(html) {
            return html = html.replace(/@include\s+"(\w+)"/g, function(match, name) {
                return getSync(name);
            }), html.replace(/%([\w_\.\-]+)%/g, function(match, key) {
                return resourceManager.get(key) || key;
            });
        }
        function promise(value) {
            return $.Deferred(function(d) {
                d.resolve(value);
            }).promise();
        }
        baseUri.endsWith("/") || (baseUri += "/");
        var templateDir = baseUri + "ui/", templates = {}, cache = {};
        return templates.custom = '<div class="ar-viewer custom" style="width: 100%; height: 100%">\n	@include "reportView"\n</div>', 
        templates.desktop = '<div class="ar-viewer desktop" style="width: 100%; height: 100%" data-bind="resizeViewerBody: {}">\n	<!-- toolbar -->\n	<div class="btn-toolbar toolbar toolbar-top">\n		<div class="btn-group btn-group-sm">			\n			<button class="btn btn-default" data-bind="command: toolbar.sidebar" title="%sidebar%">\n				<span class="glyphicon glyphicon-list-alt" />\n			</button>			\n			<button class="btn btn-default" data-bind="command: toolbar.search" title="%search%">\n				<span class="glyphicon glyphicon-search" />\n			</button>\n		</div>\n\n		<div class="btn-group btn-group-sm">\n			<button class="btn btn-default" data-bind="command: toolbar.firstPage" title="%firstPage%">\n				<span class="glyphicon glyphicon-step-backward" />\n			</button>\n			<button class="btn btn-default" data-bind="command: toolbar.prevPage" title="%prevPage%">\n				<span class="glyphicon icon-large glyphicon-chevron-left" />\n			</button>\n			<div class="navbar-left input-group-sm">\n				<input class="form-control" type="text" data-bind="valueEdit: toolbar.pageNumber, enable: toolbar.pageNumberEnabled" />\n			</div>\n			<button class="btn btn-default" data-bind="	command: toolbar.nextPage" title="%nextPage%">\n				<span class="glyphicon icon-large glyphicon-chevron-right" />\n			</button>\n			<button class="btn btn-default" data-bind="command: toolbar.lastPage" title="%lastPage%">\n				<span class="glyphicon icon-large glyphicon-step-forward" />\n			</button>\n		</div>\n\n		<div class="btn-group btn-group-sm">\n			<button id="backToParent" class="btn btn-default" data-bind="command: toolbar.backToParent" title="%backToParent%">\n				<span class="glyphicon glyphicon-share-alt mirror-by-x" />\n			</button>\n		</div>\n		\n		<div class="btn-group btn-group-sm">\n			<button class="btn btn-default" data-bind="command: toolbar.print, visible: toolbar.printButtonVisibility" title="%print%">\n				<span class="glyphicon glyphicon-print" />\n			</button>\n		</div>\n\n		<div class="btn-group btn-group-sm" data-bind="visible: toolbar.exportsAreAvailable">\n			<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-bind="enable: toolbar.canExport">\n				%saveas%<span class="caret"></span>\n			</button>\n			<ul class="dropdown-menu" role="menu">\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Pdf\'), visible: toolbar.exportToAvailable(\'Pdf\')">%pdfDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Word\'), visible: toolbar.exportToAvailable(\'Word\')">%wordDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Image\'), visible: toolbar.exportToAvailable(\'Image\')">%imageFile%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Html\'), visible: toolbar.exportToAvailable(\'Html\')">%mhtDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Xls\'), visible: toolbar.exportToAvailable(\'Xls\')">%excelWorkbook%</a></li>\n			</ul>\n		</div>\n	</div>\n\n	<div class="viewer-body" style="width: 100%">\n		<!-- sidebar -->\n		<div class="sidebar" data-bind="visible: sidebarState() != \'Hidden\'">\n			<ul class="nav nav-tabs">\n				<li data-bind="visible: hasToc, css: { \'active\': sidebarState() === \'TOC\' }"><a href="#gc-viewer-tab-toc" data-toggle="tab" data-bind="	click: function () { setSidebarState(\'TOC\') }">%toc%</a></li>\n				<li data-bind="visible: hasParameters, css: { \'active\': sidebarState() === \'Parameters\' }"><a href="#gc-viewer-tab-params" data-toggle="tab" data-bind="	click: function () { setSidebarState(\'Parameters\') }">%params%</a></li>\n				<li data-bind="css: { \'active\': sidebarState() === \'Search\' }" ><a href="#gc-viewer-tab-search" data-toggle="tab" data-bind="	click: function () { setSidebarState(\'Search\') }">%search%</a></li>\n			</ul>\n			<div class="tab-content" style="width: 100%" data-bind="activeTab: sidebarState">\n				<div id="gc-viewer-tab-toc" class="tab-pane toc-container" data-tab-name="TOC" data-bind="visible: hasToc">\n					@include "tocPane"\n				</div>\n				<div id="gc-viewer-tab-params" class="tab-pane" data-tab-name="Parameters" data-bind="visible: hasParameters, spin: document.parameterValidation">\n					@include "parametersPane"\n				</div>\n				<div id="gc-viewer-tab-search" class="tab-pane" data-tab-name="Search">\n					@include "searchPane"\n				</div>\n			</div>\n		</div>\n		@include "reportView"\n	</div>\n</div>', 
        templates.errorpanel = '<!-- error panel for desktop mode data is bound to ViewerViewModel -->\n\n<div id="gcv-errorpane" class="errorpane alert alert-danger" data-bind="visible: errorPane.visible, with: errorPane">\n	<div data-bind="visible: !showErrorInfo()">\n		\n		<button id="gcv-details" type="button" class="btn btn-sm btn-danger pull-right"\n		        data-bind="click: function () { showErrorInfo(true); }, visible: !showOnlyLastError" >\n			<span>%errorPane.Details%</span>\n		</button>\n		\n		<span class="glyphicon glyphicon-warning-sign"></span>\n		<span id="gcv-lasterror" data-bind="text: lastError"></span>\n		<span class="badge" data-bind="text: errors().length > 1 ? errors().length : \'\'"></span>\n\n		<button id="placeholder" type="button" class="btn btn-sm" style="visibility: hidden;">&nbsp;</button>\n	</div>\n		\n	<!-- Extended error info -->\n	<div id="gcv-exterrinfo" data-bind="visible: showErrorInfo" style="overflow-y: auto; max-height: 200pt;">\n		<button id="gcv-hidedetails" type="button" class="btn btn-sm btn-danger pull-right" data-bind="click: function () { showErrorInfo(false); }" >\n			<span>%errorPane.HideDetails%</span>\n		</button>\n		\n		<span class="glyphicon glyphicon-warning-sign"></span>\n		<span>%errorPane.ErrorPaneTitle%</span>\n			\n		<ul data-bind="foreach: errors">\n			<li data-bind="text: $data"></li>\n		</ul>\n\n		<div style="text-align: right">\n			<button id="gcv-dismissall" type="button" class="btn btn-default btn-sm" data-bind="click: dismissErrors">\n				<span>%errorPane.DismissAll%</span>\n			</button>\n		</div>\n		\n	</div>\n</div>', 
        templates.mobile = '<div class="ar-viewer mobile" style="width: 100%; height: 100%; position: relative" data-bind="resizeViewerBody: {}">\n	\n	<!-- top toolbar -->\n	<div class="btn-toolbar toolbar toolbar-top" style="width: 100%;">\n		<div class="btn-group">\n			<button class="btn btn-default" data-bind="command: toolbar.toc" title="%toc%">\n				<span class="glyphicon glyphicon-align-justify" />\n			</button>\n			<button class="btn btn-default" data-bind="command: toolbar.params" title="%params%" >\n				<span class="glyphicon glyphicon-cog" />\n			</button>\n			<button class="btn btn-default" data-bind="command: toolbar.search" title="%search%">\n				<span class="glyphicon glyphicon-search" />\n			</button>\n		</div>\n\n		<div class="btn-group" data-bind="visible: toolbar.exportsAreAvailable">\n			<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-bind="enable: toolbar.canExport" title="%saveas%">\n				<span class="glyphicon glyphicon-export" />\n			</button>\n			<ul class="dropdown-menu" role="menu">\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Pdf\'), visible: toolbar.exportToAvailable(\'Pdf\')">%pdfDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Word\'), visible: toolbar.exportToAvailable(\'Word\')">%wordDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Image\'), visible: toolbar.exportToAvailable(\'Image\')">%imageFile%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Html\'), visible: toolbar.exportToAvailable(\'Html\')">%mhtDocument%</a></li>\n				<li><a href="#" data-bind="command: toolbar.exportTo(\'Xls\'), visible: toolbar.exportToAvailable(\'Xls\')">%excelWorkbook%</a></li>\n			</ul>\n		</div>\n	</div>\n	\n	<div class="viewer-body" style="width: 100%;">\n		@include "reportView"\n	</div>\n	\n	<div class="panelsSite">\n		@include "mtocPane"\n		@include "msearchPane"\n		@include "mparametersPane"\n	</div>\n\n	<!-- bottom toolbar -->\n	<div class="btn-toolbar toolbar toolbar-bottom" style="width: 100%;">\n		<div class="btn-group">\n			<button class="btn btn-default" data-bind="command: toolbar.prevPage" title="%prevPage%">\n				<span class="glyphicon glyphicon-circle-arrow-left" />\n			</button>\n			<button class="btn btn-default" data-bind="command: toolbar.nextPage" title="%nextPage%">\n				<span class="glyphicon glyphicon-circle-arrow-right" />\n			</button>\n		</div>\n		\n		<div class="btn-group">\n			<div class="navbar-left">\n				<input class="form-control" type="text" data-bind="valueEdit: toolbar.pageNumber, enable: toolbar.pageNumberEnabled" tabindex="-1" />\n			</div>\n		</div>\n		\n		<div class="btn-group">\n			<button class="btn btn-default" data-bind="command: toolbar.backToParent" title="%backToParent%">\n				<span class="glyphicon glyphicon-share-alt mirror-by-x" />\n			</button>\n		</div>\n	</div>\n</div>\n', 
        templates.mparameternullswitch = '<!-- ko if: nullable -->	\n<div style="margin-top: 5pt">\n	<label>%null-label%</label>\n	<div class="make-switch" style="vertical-align: middle" data-bind="bootstrapSwitch: isValueNull"\n			data-on-label="%yes%" data-off-label="%no%">\n		<input type="checkbox">\n	</div>\n</div>\n<!-- /ko -->\n', 
        templates.mparameterspane = '<!-- parameters pane for mobile layout -->\n<div id="parametersPane" class="panel panel-default overlay" data-bind="showPanel: parametersPane.visible, spin: document.parameterValidation">\n	<div class="panel-heading" style="text-align: center">\n		<button type="button" class="close">&times;</button>\n		<h2 class="panel-title">%params%</h2>\n	</div>\n	<div class="panel-body">\n		<div class="params-pane" data-bind="foreach: parametersPane.parameters">\n				<h5 data-bind="text: prompt" />\n\n				<div class="param-value truncatedString well well-sm"\n					 data-bind="css: { \'has-error\': errorText().length > 0 }, attr: {pname: name},\n	showEditor: { template: \'parameter-editor-template\', placeholder: $($element).closest(\'.ar-viewer\').find(\'#paramEditorHere\'), enable: enabled, visible: enabled && $parent.visible, onClose: function (v) { $updateValuesFromModel(v); } }">\n					<i class="glyphicon glyphicon-play pull-right" data-bind="visible: enabled"></i>\n					<span data-bind="text: nullable && value() == null ? \'%null%\' : stringValue"></span>&nbsp;\n				</div>\n						\n				<div style="color: red" data-bind="visible: errorText().length > 0">\n					<span class="glyphicon glyphicon-exclamation-sign" />\n					<span data-bind="text: errorText" style="font-size: small" />\n				</div>\n		</div>\n\n		<button id="refresh-button" class="btn btn-block btn-default btn-primary" data-bind="command: parametersPane.refreshReportAndClose">\n			%refreshReport%\n		</button>\n	</div>\n</div>\n\n<div id="paramEditorHere" />\n\n<!-- single parameter editor form for mobile target platform -->\n<script type="text/html" id="parameter-editor-template">\n	<div class="panel panel-default overlay" style="z-index: 11;">\n		<div class="panel-heading" style="text-align: center; vertical-align: middle">\n			<button type="button"  class="btn close-onclick btn-default btn-sm pull-left">\n				<i class="glyphicon glyphicon-arrow-left" />\n			</button>\n			<button type="button" class="close">&times;</button>\n			<span class="panel-title" data-bind="text: prompt"></span>\n		</div>\n		<div class="panel-body">\n			<!-- ko if: editor() == \'SingleValue\' -->\n			<!-- ko if: type == \'bool\' -->		\n			<ul class="list-group">\n				<li class="list-group-item close-onclick" data-bind="click: function () { value(true); }">%true%\n					<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: value"></i>\n				</li>\n				<li class="list-group-item close-onclick" data-bind="click: function () { value(false); }">%false%\n					<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: value() === false"></i>\n				</li>\n				<!-- ko if: nullable -->\n				<li class="list-group-item close-onclick" data-bind="click: function () { isValueNull(true); }">%null%\n					<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: isValueNull"></i>\n				</li>\n				<!-- /ko -->\n			</ul>\n			<!-- /ko -->\n\n			<!-- ko if: (type == \'datetime\' && dateOnly == true) -->\n			<input type="date" class="form-control" data-date-format="yyyy-mm-dd" min="1001-01-01" max="9999-12-31" data-bind="value: datePickerValue, attr: { pname: name }" />\n			<!-- /ko -->\n			<!-- ko if: (type == \'datetime\' && dateOnly == false) -->\n			<input type="datetime-local" step="1" class="form-control" data-date-format="yyyy-mm-dd hh:ii:ss" min="1001-01-01T00:00:00" max="9999-12-31T23:59:59" data-bind="value: datePickerValue, attr: { pname: name }" />\n			<!-- /ko -->\n\n			<!-- ko if: !(type == \'datetime\' || type == \'bool\') -->\n			<input type="text" class="form-control" data-bind="value: stringValue, attr: { pname: name }" />\n			<!-- /ko -->\n\n			<!-- ko if: type != \'bool\' && nullable -->	\n			@include "mparameterNullSwitch"\n			<!-- /ko -->\n\n			<!-- /ko -->\n			\n			<!-- ko if: editor() == \'SelectOneFromMany\' -->\n			<ul class="list-group" data-bind="foreach: options">\n				<li class="list-group-item close-onclick" data-bind="click: function () { $parent.value(value); }">\n					<span data-bind="text: label"></span>\n					<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: selected"></i>\n				</li>\n			</ul>\n			<!-- /ko -->\n			\n			<!-- ko if: editor() == \'MultiValue\' -->\n			<ul class="list-group">\n				<!-- ko foreach: options -->	\n				<li class="list-group-item" data-bind="click: function() { selected(!selected()); }">\n					<span data-bind="text: label"></span>\n					<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: selected"></i>\n				</li>\n				<!-- /ko -->\n				\n				<!-- TODO should be \'nullable\' but this does not work yet as server tells parameter is not nullable RdlxReportParameter.Nullable impl -->\n				<!-- ko if: true -->	\n				<li class="list-group-item" data-bind="click: function () { clearOptions(); }">\n					%clearAllOptions%\n				</li>\n				<!-- /ko -->\n			</ul>\n\n			<!-- /ko -->\n		\n			<!-- ko if: editor() == \'MultiLine\' -->\n			<textarea rows="5" class="form-control" data-bind="value: stringValue, enable: enabled, attr: { pname: name }" />\n			@include "mparameterNullSwitch"\n			<!-- /ko -->\n		\n			<div style="color: red" data-bind="visible: errorText().length > 0">\n				<span class="glyphicon glyphicon-exclamation-sign" />\n				<span data-bind="text: errorText" style="font-size: small" />\n			</div>\n\n		</div>\n	</div>\n</script>', 
        templates.msearchpane = '<!-- template for search result item -->\n<div class="panel panel-default overlay" data-bind="showPanel: searchPane.visible">\n	<div class="panel-heading" style="text-align: center">\n		<button type="button" class="close">&times;</button>\n		<h2 class="panel-title">%search%</h2>\n	</div>\n	<div class="panel-body" data-bind="with: searchPane">\n		<div class="form-horizontal">\n			<input type="search" class="form-control" data-bind="value: searchString, valueUpdate: \'input\', event: { keypress: keyPressHandler }" />\n			<div class="form-group" style="margin: 4pt 4pt 0 4pt">\n				<label for="matchCase" class="control-label" style="vertical-align: middle">%matchCase%</label>\n				<div class="make-switch pull-right" data-bind="bootstrapSwitch: matchCase"\n				     data-on-label="%on%" data-off-label="%off%">\n					<input type="checkbox" id="matchCase"/>\n				</div>\n			</div>\n			<div class="form-group" style="margin: 4pt 4pt 0 4pt">\n				<label for="whole"  class="control-label"  style="vertical-align: middle">%wholePhrase%</label>\n				<div class="make-switch pull-right" data-bind="bootstrapSwitch: wholePhrase"\n				     data-on-label="%on%" data-off-label="%off%">\n					<input type="checkbox" id="whole"/>\n				</div>\n			</div>\n			<button class="btn btn-default btn-primary btn-block" data-bind="command: search" style="margin-top: 5pt">%search%</button>\n			<!-- ko if: isReady -->\n			<!-- ko if: found -->\n			<ul class="list-group toc" data-bind="foreach: searchResults" style="margin-top: 5pt">\n				<li class="list-group-item">\n					<div data-bind="click: $parent.navigateAndClose" class="truncatedString">\n						<i class="glyphicon glyphicon-chevron-right pull-right"></i>\n						<a data-bind="text: text" href="#"/>\n					</div>\n				</li>\n			</ul>\n			<button class="btn" data-bind="click: more, visible: hasMore">%more%</button>\n			<!-- /ko-->\n			<!-- ko ifnot: found -->\n			<span>%noResults%</span>\n			<!-- /ko-->\n			<!-- /ko -->\n		</div>\n	</div>\n</div>', 
        templates.mtocpane = '<div class="panel panel-default overlay" data-bind="showPanel: tocPane.visible">\n	<div class="panel-heading">\n		<div class="btn-toolbar" style="text-align: center">\n			<button type="button" class="close" data-bind="click: function() { tocPane.reset(); tocPane.visible(false); }">&times;</button>\n			<a class="btn btn-default pull-left" title="%back%" data-bind="command: tocPane.back, visible: tocPane.back.enabled()">\n				<i class="glyphicon glyphicon-arrow-left" />\n			</a>\n			<span class="panel-title">%tocfull%</span>\n		</div>\n	</div>\n	<div class="panel-body" data-bind="with: tocPane.selectedNode">\n		<ul class="list-group toc" data-bind="foreach: kids">\n			<li class="list-group-item">\n				<div class="truncatedString" style="min-height: 1.2em" data-bind="click: function () { $root.tocPane.navigateAndClose($data); }">\n					<i class="glyphicon glyphicon-chevron-right pull-right"\n						data-bind="visible: !isLeaf, click: function(data, e) { e.stopImmediatePropagation(); $root.tocPane.select($data); }"></i>\n					<a data-bind="text: name" />\n				</div>\n			</li>\n		</ul>\n	</div>\n</div>\n', 
        templates.parameterspane = '<!-- parameters pane for desktop layout -->\n<div class="panel-body" style="min-width: 120px">\n\n	<div data-bind="foreach: parametersPane.parameters">\n		<div style="margin-bottom: 10px;">\n			<label data-bind="text: prompt, tooltip: name"></label>\n\n			<div class="param-value" data-bind="css: { \'has-error\': errorText().length > 0 }, attr: { pname: name }">\n				<!-- ko if: editor() == \'SingleValue\' -->\n				<!-- ko if: type == \'bool\' -->\n				<label class="radio-inline">\n					<input type="radio" value="true" data-bind="checked: stringValue, enable: enabled" />%true%</label>\n				<label class="radio-inline">\n					<input type="radio" value="false" data-bind="checked: stringValue, enable: enabled" />%false%</label>\n				<label class="radio-inline" data-bind="visible: nullable">\n					<input type="radio" value="null" data-bind="click: function() { isValueNull(true); }, checked: isValueNull() ? \'null\' : stringValue(), enable: enabled" />%null%</label>\n				<!-- /ko -->\n				<!-- ko if: (type == \'datetime\' && dateOnly == true) -->\n				<input type="date" class="form-control" data-date-format="yyyy-mm-dd" min="1001-01-01" max="9999-12-31" data-bind="value: datePickerValue, enable: enabled" />\n				<!-- /ko -->\n				<!-- ko if: (type == \'datetime\' && dateOnly == false) -->\n				<input type="datetime-local" step="1" class="form-control" data-date-format="yyyy-mm-dd hh:ii:ss" min="1001-01-01T00:00:00" max="9999-12-31T23:59:59" data-bind="value: datePickerValue, enable: enabled" />\n				<!-- /ko -->\n				<!-- ko if: !(type == \'datetime\' || type == \'bool\') -->\n				<input type="text" class="form-control" data-bind="value: stringValue, enable: enabled" />\n				<!-- /ko -->\n				<!-- /ko -->\n\n				<!-- ko if: editor() == \'MultiLine\' -->\n				<textarea rows="5" class="form-control" data-bind="value: stringValue, enable: enabled" />\n				<!-- /ko -->\n\n				<!-- ko if: editor() == \'SelectOneFromMany\' -->\n				<div class="dropdown">\n					<a data-toggle="dropdown" class="dropdown-toggle form-control btn btn-default" style="text-align: left" data-bind="active: enabled">\n						<i class="glyphicon glyphicon-chevron-down pull-right"></i>\n						<div class="truncatedString" data-bind="text: displayValue"></div>\n					</a>\n					<ul class="dropdown-menu dropdown-menu-uniform-size" data-bind="foreach: options">\n						<li data-bind="click: function() { $parent.value(value); }">\n							<a tabindex="-1">\n								<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: selected"></i>\n								<div class="truncatedString" data-bind="text: label"></div>\n							</a>\n						</li>\n					</ul>\n				</div>\n				<!-- /ko -->\n\n				<!-- ko if: editor() == \'MultiValue\' -->\n				<div class="dropdown" data-bind="dropdownForm: { onApply: function(v) { $updateValuesFromModel(v); }, onShown: function() { $($element).find(\'a:first span\').text(\'\'); } }">\n					<a data-toggle="dropdown" class="dropdown-toggle form-control btn btn-default" style="text-align: left" data-bind="active: enabled">\n						<i class="glyphicon glyphicon-chevron-down pull-right"></i>\n						<div class="truncatedString" data-bind="text: displayValue"></div>\n					</a>\n					<ul class="dropdown-menu dropdown-menu-uniform-size dropdown-menu-form">\n						<!-- ko foreach: options -->\n						<li data-bind="click: function() { selected(!selected()); }">\n							<a tabindex="-1">\n								<i class="glyphicon glyphicon-ok pull-right" data-bind="visible: selected"></i>\n								<div class="truncatedString" data-bind="text: label"></div>\n							</a>\n						</li>\n						<!-- /ko -->\n						<li data-bind="click: function() { clearOptions(); }">\n							<a tabindex="-1">\n								<div class="truncatedString">%clearAllOptions%</div>\n							</a>\n						</li>\n					</ul>\n				</div>\n				<!-- /ko -->\n\n				<span data-bind="visible: nullable && !(editor() == \'SingleValue\' && type == \'bool\') && editor() != \'SelectOneFromMany\'">\n					<input type="checkbox" data-bind="checked: isValueNull, enable: enabled">\n					<label>%null%</label>\n				</span>\n			</div>\n\n			<div style="color: red" data-bind="visible: errorText().length > 0">\n				<span class="glyphicon glyphicon-exclamation-sign" />\n				<span data-bind="text: errorText" style="font-size: small" />\n			</div>\n		</div>\n	</div>\n\n	<div>\n		<button id="refresh-button" class="btn btn-block btn-default btn-primary" data-bind="command: parametersPane.refreshReport">\n			%refreshReport%\n		</button>\n	</div>\n</div>\n', 
        templates.reportview = '<div style="height: 100%; overflow: hidden; position: relative;" data-bind="spin: document.inProgress">\n	\n	@include "errorPanel"\n\n	<div style="width: 100%; height: 100%; padding: 5pt; overflow: auto; position: absolute;" \n		data-bind="scrollPosition: document.location" >\n		<div style="position: absolute;"  class="document-view" data-bind="htmlPage: { page: document.pageContent, onupdate: processPage }" />\n		<div style="position: absolute; background: blueviolet; opacity: 0.5; filter: alpha(opacity=50);" \n			data-bind="visible: searchPane.highlightEnabled, style: { left: searchPane.highlightLeft, top: searchPane.highlightTop, width: searchPane.highlightWidth, height: searchPane.highlightHeight }" />\n	</div>\n\n</div>\n', 
        templates.searchpane = '<div class="panel-body" data-bind="with: searchPane">\n	<div>\n		<label class="control-label">%findLabel%</label>\n	</div>\n	<div>\n		<input type="search" class="form-control" data-bind="value: searchString, valueUpdate: \'input\', event: { keypress: keyPressHandler }"/>\n	</div>\n	<div style="margin-top: 5pt">\n		<input type="checkbox" data-bind="checked: matchCase" />\n		<label class="control-label">%matchCase%</label>\n	</div>\n	<div>\n		<input type="checkbox" data-bind="checked: wholePhrase" />\n		<label class="control-label">%wholePhrase%</label>\n	</div>\n	<div style="float: right">\n		<button class="btn btn-primary" data-bind="command: clear" style="margin: 1pt">%clear%</button>\n		<button class="btn btn-primary" data-bind="command: search" style="margin: 1pt">%search%</button>\n	</div>\n	<div style="clear: both">\n		<!-- ko if: isReady -->\n		<!-- ko if: found -->\n		<div data-bind="foreach: searchResults" style="margin-top: 5pt; border: 1pt solid black;">\n			<div class="truncatedString" data-bind="click: $parent.navigate" style="margin: 3pt;">\n				<a data-bind="text: text" href="#" />\n			</div>\n		</div>\n		<button class="btn" data-bind="click: more, visible: hasMore">%more%</button>\n		<!-- /ko-->\n		<!-- ko ifnot: found -->\n		<div style="margin: 5pt; padding: 5pt; border: 1pt solid black;">\n			%noResults%\n		</div>\n		<!-- /ko-->\n		<!-- /ko -->\n	</div>\n</div>\n', 
        templates.tocpane = '<div data-bind="template: { name: \'toc-template\', data: tocPane.root }">\n</div>\n<script id="toc-node-template" type="text/html">\n	<li class="toc-node collapsed"\n		data-bind="css: { leaf: $data.isLeaf != false, branch: $data.isLeaf == false }, treeNode: { template: \'toc-template\', node: $data }">\n		<a class="toggle" href="#" data-bind="visible: $data.isLeaf == false"></a>\n		<a class="link" href="#" data-bind="text: name, click: function() { $root.tocPane.navigate($data); return false; }"></a>\n	</li>\n</script>\n<script id="toc-template" type="text/html">\n	<ul class="toc" data-bind="template: { name: \'toc-node-template\', foreach: $data.kids }"></ul>\n</script>', 
        $(resourceManager).on("updated", function() {
            cache = {};
        }), {
            get: get
        };
    }
    function TocPaneViewModel(viewer) {
        function convertNode(node) {
            var promiseFn, kids;
            return $.extend({}, node, {
                kids: $.isFunction(node.kids) ? (kids = ko.observable([]), promiseFn = node.kids, 
                ko.computed({
                    read: function() {
                        return promiseFn && promiseFn().done(function(newKids) {
                            promiseFn = null, kids(newKids.map(convertNode));
                        }), kids();
                    },
                    deferEvaluation: !0
                })) : (node.kids || []).map(convertNode)
            });
        }
        function reset() {
            _stack.removeAll(), _selectedNode(_root());
        }
        function _navigate(node) {
            reset(), viewer.pageIndex(node.page);
            var dpi = getDpi(), location = node.location || {
                left: 0,
                top: 0
            };
            viewer.location({
                left: location.left * dpi,
                top: location.top * dpi
            });
        }
        var _root = ko.computed(function() {
            return convertNode(viewer.document().toc());
        }), _selectedNode = ko.observable(_root()), _stack = ko.observableArray(), tocVisible = ko.computed({
            read: function() {
                return viewer.sidebarState() === SidebarState.TOC;
            },
            write: function(value) {
                viewer.sidebarState(value ? SidebarState.TOC : SidebarState.Hidden);
            }
        });
        return _root.subscribe(reset), {
            visible: tocVisible,
            get root() {
                return _root;
            },
            get selectedNode() {
                return _selectedNode;
            },
            navigateAndClose: function(node) {
                viewer.sidebarState(SidebarState.Hidden), _navigate(node);
            },
            navigate: function(node) {
                _navigate(node);
            },
            reset: reset,
            select: function(node) {
                _stack.push(_selectedNode()), _selectedNode(node);
            },
            back: {
                exec: function() {
                    var node = _stack.pop();
                    _selectedNode(node);
                },
                enabled: ko.computed(function() {
                    return _stack().length > 0;
                })
            }
        };
    }
    function TogglesHistory() {
        var togglesSet = [];
        this.toggle = function(toggleId) {
            var elementIndex = togglesSet.indexOf(toggleId);
            elementIndex > -1 ? togglesSet.splice(elementIndex, 1) : togglesSet.push(toggleId);
        }, this.getSet = function() {
            var result = togglesSet.slice();
            return result;
        };
    }
    function ToolbarViewModel(services, viewer) {
        function pageCount() {
            return viewer.document().pageCount();
        }
        var _pageNumber = ko.computed({
            read: function() {
                var inProgress = viewer.document().state() == DocumentState.progress, pc = pageCount();
                return 0 === pc ? "" : viewer.pageIndex() + 1 + "/" + pc + (inProgress ? "+" : "");
            },
            write: function(value) {
                var n = parseInt(value, 10);
                !isNaN(n) && n >= 1 && n <= pageCount() && viewer.pageIndex(n - 1);
            }
        });
        viewer.document.subscribe(function() {
            _lastSidebarState = null;
        }), _pageNumber.text = function() {
            return "" + (viewer.pageIndex() + 1);
        };
        var _lastSidebarState, _isDocReady = ko.computed(function() {
            return pageCount() > 0 && (viewer.document().state() === DocumentState.progress || viewer.document().state() === DocumentState.completed);
        }), _availableExports = ko.computed(function() {
            return viewer.availableExports().length > 0;
        }), _printButtonVisibility = services.browserSpecific.PrintButtonVisibility;
        return {
            printButtonVisibility: _printButtonVisibility,
            pageNumber: _pageNumber,
            pageNumberEnabled: ko.computed(function() {
                return pageCount() > 0;
            }),
            firstPage: {
                exec: function() {
                    viewer.pageIndex(0);
                },
                enabled: ko.computed(function() {
                    return pageCount() > 0 && 0 !== viewer.pageIndex();
                })
            },
            lastPage: {
                exec: function() {
                    viewer.pageIndex(pageCount() - 1);
                },
                enabled: ko.computed(function() {
                    return pageCount() > 0 && viewer.pageIndex() !== pageCount() - 1;
                })
            },
            prevPage: {
                exec: function() {
                    viewer.pageIndex(viewer.pageIndex() - 1);
                },
                enabled: ko.computed(function() {
                    return pageCount() > 0 && viewer.pageIndex() - 1 >= 0;
                })
            },
            nextPage: {
                exec: function() {
                    viewer.pageIndex(viewer.pageIndex() + 1);
                },
                enabled: ko.computed(function() {
                    return pageCount() > 0 && viewer.pageIndex() + 1 < pageCount();
                })
            },
            sidebar: {
                exec: function() {
                    viewer.sidebarState() !== SidebarState.Hidden ? (_lastSidebarState = viewer.sidebarState(), 
                    viewer.sidebarState(SidebarState.Hidden)) : viewer.sidebarState(_lastSidebarState || (_isDocReady() || !viewer.report().hasPromptParameters() ? SidebarState.Search : SidebarState.Parameters));
                },
                enabled: !0
            },
            search: {
                exec: function() {
                    viewer.sidebarState(SidebarState.Search);
                },
                enabled: _isDocReady
            },
            toc: {
                exec: function() {
                    viewer.sidebarState(SidebarState.TOC);
                },
                enabled: ko.computed(function() {
                    return viewer.document().toc && viewer.document().toc().kids.length > 0;
                })
            },
            params: {
                exec: function() {
                    viewer.sidebarState(SidebarState.Parameters);
                },
                enabled: ko.computed(function() {
                    return viewer.report().hasPromptParameters();
                })
            },
            backToParent: {
                exec: function() {
                    viewer.sidebarState(SidebarState.Hidden), viewer.backToParent();
                },
                enabled: ko.computed(function() {
                    return viewer.backToParentEnabled();
                })
            },
            print: {
                exec: function() {
                    services.printingService.print(viewer.document());
                },
                enabled: ko.computed(function() {
                    return _isDocReady() && services.printingService;
                })
            },
            exportTo: function(exportType) {
                return {
                    exec: function() {
                        viewer.document()["export"](exportType, {
                            saveAsDialog: !0
                        }).done(function(uri) {
                            if (uri) {
                                var newWin = null;
                                try {
                                    newWin = window.open(uri);
                                } catch (e) {}
                                newWin || (window.location = uri);
                            }
                        }).fail(viewer.handleError);
                    },
                    enabled: _isDocReady
                };
            },
            exportToAvailable: function(exportType) {
                return viewer.availableExports().indexOf(exportType) >= 0;
            },
            get exportsAreAvailable() {
                return _availableExports;
            },
            get canExport() {
                return _isDocReady;
            }
        };
    }
    function ViewerImpl(services, options, viewModels) {
        function createReportModel() {
            viewerModel.report && documentReadySubscribe && (documentReadySubscribe.dispose(), 
            documentReadySubscribe = null), viewerModel.report = ReportModel(reportService, options.report, null, resourceManager), 
            options.reportLoaded && ko.waitFor(viewerModel.report().state, function(st) {
                return st === ReportModelState.open || st === ReportModelState.documentReady;
            }, function() {
                options.reportLoaded({
                    parameters: viewerModel.report().parameters()
                });
            });
        }
        function init() {
            options.report && createReportModel(), options.availableExports && viewerModel.availableExports(options.availableExports), 
            options.localeUri ? optionMap.localeUri(options.localeUri) : updateTemplate();
        }
        function viewerElement() {
            return $(options.element);
        }
        function findElement(selector) {
            var $e = viewerElement().find(selector);
            return $e.length ? $e[0] : null;
        }
        function updateTemplate() {
            var uiType = options.uiType || "mobile";
            templates.get(uiType).done(function(html) {
                var $e = viewerElement();
                $e.html(html), ko.applyBindings(viewModel, $e.find(".ar-viewer")[0]);
            });
        }
        function optionImpl(name) {
            var invalid = function() {
                throw new Error("Ivalid option name: " + (name || "(null or undefined)"));
            };
            return (optionMap[name] || invalid).apply(null, Array.prototype.slice.call(arguments, 1));
        }
        function refresh() {
            viewerModel.clearErrors(), viewerModel.report().run();
        }
        function print() {
            var pc = viewerModel.document().pageCount();
            if (0 === pc) throw new Error("document is not ready for printing");
            if (!services.printingService) throw new Error("Printing service is not available");
            services.printingService.print(viewerModel.document()).fail(viewerModel.handleError);
        }
        function exportImpl(exportType, callback, saveAsDialog, settings) {
            var pc = viewerModel.document().pageCount();
            if (0 === pc) throw new Error("document is not ready for export");
            settings = settings || {}, settings.saveAsDialog = !!saveAsDialog, viewerModel.document()["export"](exportType, settings).done(callback || noop).fail(viewerModel.handleError);
        }
        function goToPage(number, offset, callback) {
            if (isNaN(number) || 0 >= number || number > viewerModel.document().pageCount()) throw new Error("The 'page' parameter must be integer in range 1..PageCount.");
            if (viewerModel.document().state() !== DocumentState.completed || 0 === viewerModel.document().pageCount()) throw new Error("Can't perform goToPage due to document state.");
            if (callback) var watcher = viewModel.document.pageContent.subscribe(function() {
                watcher.dispose(), callback();
            });
            viewerModel.pageIndex(number - 1), offset && viewerModel.location(offset);
        }
        function backToParent() {
            viewerModel.backToParent();
        }
        function search(searchTerm, searchOptions, callback) {
            if (viewerModel.document().state() !== DocumentState.completed) throw new Error("Can't perform search due to document state.");
            viewerModel.document().search({
                text: searchTerm,
                matchCase: searchOptions.matchCase,
                wholePhrase: searchOptions.wholePhrase,
                from: searchOptions.from,
                maxSearchResults: searchOptions.maxSearchResults || options.maxSearchResults
            }).done(callback || noop).fail(viewerModel.handleError);
        }
        function getToc(callback) {
            function toPromise(value) {
                return "function" == typeof value ? value() : $.Deferred().resolve(value).promise();
            }
            function traverseTocTree(node) {
                function traverseKids(kids) {
                    return $.when.apply($, kids.map(traverseTocTree));
                }
                var d = $.Deferred();
                return null === node || void 0 === node ? d.resolve($.extend({}, nullNode, {})) : node.isLeaf || !node.kids ? d.resolve($.extend({}, node, {})) : (toPromise(node.kids).then(function(kids) {
                    traverseKids(kids).then(function() {
                        d.resolve($.extend({}, node, {
                            kids: [].slice.call(arguments)
                        }));
                    });
                }), d);
            }
            var nullNode = {
                name: "",
                page: 0,
                location: {
                    left: 0,
                    top: 0
                },
                isLeaf: !0,
                kids: []
            };
            viewerModel.document().getToc().then(traverseTocTree).done(callback);
        }
        function destroy() {
            var $e = viewerElement();
            ko.cleanNode($e[0]), $e.html(""), viewerModel.clearReports(!1);
        }
        if (!options) throw new Error("Viewer options are not specified.");
        var documentReadySubscribe, reportService = services.reportService, resourceManager = services.resourceManager, templates = services.templates, viewerModel = viewModels.viewerModel, viewModel = viewModels.viewerViewModel, viewer = {
            destroy: destroy,
            option: optionImpl,
            refresh: refresh,
            print: print,
            "export": exportImpl,
            getToc: getToc,
            goToPage: goToPage,
            backToParent: backToParent,
            search: search,
            get pageCount() {
                return viewerModel.document().pageCount();
            },
            get currentPage() {
                return viewerModel.pageIndex() + 1;
            },
            get toolbar() {
                return findElement(".toolbar");
            },
            get toolbarTop() {
                return findElement(".toolbar-top");
            },
            get toolbarBottom() {
                return findElement(".toolbar-bottom");
            }
        }, optionMap = {
            uiType: function() {
                return arguments.length > 0 && (options.uiType = arguments[0], updateTemplate(options.uiType || "mobile", !1)), 
                options.uiType;
            },
            report: function() {
                return arguments.length > 0 && (options.report = arguments[0], createReportModel()), 
                options.report;
            },
            reportService: function() {
                return arguments.length > 0 && (options.reportService = arguments[0], reportService = ReportServiceSelector(options.reportService, resourceManager)), 
                options.reportService;
            },
            localeUri: function() {
                if (arguments.length > 0) {
                    var uri = arguments[0];
                    if ("string" != typeof uri || !uri) throw new Error("Invalid locale URI.");
                    resourceManager.update(uri).done(function() {
                        options.localeUri = uri, updateTemplate();
                    }).fail(function(error) {
                        console.log("Unable to load locale from '{0}'. Error: {1}".format(uri, error));
                    });
                }
                return options.localeUri;
            },
            availableExports: function() {
                return arguments.length > 0 && viewerModel.availableExports(arguments[0]), viewerModel.availableExports();
            },
            action: function() {
                return arguments.length > 0 && (options.action = arguments[0]), options.action;
            },
            error: function() {
                return arguments.length > 0 && (options.error = arguments[0]), options.error;
            },
            reportLoaded: function() {
                return arguments.length > 0 && (options.reportLoaded = arguments[0]), options.reportLoaded;
            },
            documentLoaded: function() {
                return arguments.length > 0 && (options.documentLoaded = arguments[0]), options.documentLoaded;
            },
            maxSearchResults: function() {
                return arguments.length > 0 && (options.maxSearchResults = arguments[0]), options.maxSearchResults;
            },
            element: function() {
                if (arguments.length > 0) throw new Error("You can't change the element.");
                return options.element;
            }
        };
        return init(), viewer;
    }
    function ViewerModel(reportService, options) {
        function clearDrillthroughStack(async) {
            $(_drillthroughStack).each(function() {
                var drill = _drillthroughStack.pop();
                drill.Report.dispose(async);
            }), _backToParentEnabled(_drillthroughStack.length > 0);
        }
        function errorHandler(e, error) {
            viewer.handleError(error);
        }
        function setReport(value) {
            if (!value) throw new ReferenceError("value");
            _reloadingOnInteraction = !1, _report() && ($(_report()).unbind("error", errorHandler), 
            $(_report()).unbind("documentReady", onDocumentReady)), viewer.document = nullDocument, 
            _report(value), $(value).on("error", errorHandler), $(value).on("documentReady", onDocumentReady), 
            ko.waitFor(value.state, function(st) {
                return st == ReportModelState.open;
            }, function(st) {
                value.hasPromptParameters() ? value.autoRun() && value.allParametersValid() || _sidebarState(SidebarState.Parameters) : _sidebarState() === SidebarState.Parameters && _sidebarState(SidebarState.Hidden);
            });
        }
        function chain(fn1, fn2) {
            return function() {
                fn1 && fn1.apply && fn1(), fn2 && fn2.apply && fn2();
            };
        }
        function onDocumentReady(e, document) {
            viewer.document = document;
        }
        if (!reportService) throw new ReferenceError("reportService is required here!");
        var nullDocument = DocumentModel(), _reloadingOnInteraction = !1, _pageIndex = ko.observable(0), _location = ko.observable({
            left: 0,
            top: 0
        }), _report = ko.observable(), _document = ko.observable(nullDocument), _sidebarState = ko.observable(SidebarState.Hidden), _availableExports = ko.observable([ ExportType.Pdf, ExportType.Word, ExportType.Image, ExportType.Html, ExportType.Xls ]), _drillthroughStack = [], _backToParentEnabled = ko.observable(!1), _errors = ko.observable([]), _showOnlyLastError = options ? options.showOnlyLastError : !1, unbindDocument = noop, viewer = {
            get pageIndex() {
                return _pageIndex;
            },
            get location() {
                return _location;
            },
            get sidebarState() {
                return _sidebarState;
            },
            get report() {
                return _report;
            },
            set report(value) {
                viewer.clearReports(!0), viewer.clearErrors(), setReport(value), value.state() === ReportModelState.noReport && value.open();
            },
            get document() {
                return _document;
            },
            set document(value) {
                if (!value) throw new ReferenceError("value");
                unbindDocument(), _document(value), $(value).on("error", errorHandler), unbindDocument = function() {
                    $(_document()).unbind("error", errorHandler);
                }, options && options.documentLoaded && (unbindDocument = chain(unbindDocument, ko.waitFor(ko.computed(function() {
                    return _document().state();
                }), function(val) {
                    return val === DocumentState.completed;
                }, options.documentLoaded))), _reloadingOnInteraction || (_pageIndex(0), _location({
                    left: 0,
                    top: 0
                })), _reloadingOnInteraction = !1;
            },
            get availableExports() {
                return _availableExports;
            },
            set availableExports(value) {
                _availableExports(value || []);
            },
            drillthrough: function(drillthroughLink) {
                viewer.report().drillthrough(drillthroughLink).done(function(result) {
                    _drillthroughStack.push({
                        Report: viewer.report(),
                        Document: viewer.document()
                    }), _backToParentEnabled(_drillthroughStack.length > 0), setReport(result.report), 
                    result.document && (viewer.document = result.document);
                });
            },
            toggle: function(toggleData) {
                var savedPageIndex = _pageIndex();
                return _reloadingOnInteraction = !0, viewer.report().toggle(toggleData).then(function() {
                    ko.waitFor(ko.computed(function() {
                        return _document().state();
                    }), function(val) {
                        return val === DocumentState.completed;
                    }, function() {
                        var pagesNumber = _document().pageCount();
                        savedPageIndex >= pagesNumber && (savedPageIndex = pagesNumber - 1), _pageIndex(savedPageIndex);
                    });
                });
            },
            backToParent: function() {
                if (0 === _drillthroughStack.length) throw new Error("Report stack is empty!");
                var oldReport = _report();
                oldReport && oldReport.dispose(!0);
                var drill = _drillthroughStack.pop();
                _backToParentEnabled(_drillthroughStack.length > 0), null !== drill && void 0 !== drill && (setReport(drill.Report), 
                viewer.document = drill.Document);
            },
            get backToParentEnabled() {
                return _backToParentEnabled;
            },
            get errors() {
                return _errors;
            },
            get showOnlyLastError() {
                return _showOnlyLastError;
            },
            handleError: function(error) {
                if (error) {
                    var errorObject = {
                        message: String(error)
                    };
                    if (options && options.error && options.error.apply && options.error(errorObject)) return;
                    errorObject.message && _errors(_errors().concat([ String(errorObject.message) ]));
                }
            },
            clearReports: function(async) {
                clearDrillthroughStack(async);
                var oldReport = _report();
                oldReport && oldReport.dispose(async);
            },
            clearErrors: function() {
                _errors([]);
            }
        };
        return viewer.report = ReportModel(reportService), viewer;
    }
    function ViewerViewModel(services, options, viewer) {
        var _document = DocumentViewModel(viewer), _tocPane = TocPaneViewModel(viewer), _parametersPane = ParameterPaneViewModel(services, viewer), _searchPane = SearchPaneViewModel(viewer, options.maxSearchResults, options.element), _errorsPane = ErrorPaneViewModel(viewer), _toolbar = ToolbarViewModel(services, viewer), _paramsExists = ko.computed(function() {
            return viewer.report().parameters().filter(function(p) {
                return void 0 === p.promptUser || p.promptUser;
            }).length > 0;
        }), _hasToc = ko.computed(function() {
            return viewer.document().toc().kids.length > 0;
        }), _interactivityProcessor = InteractivityProcessor({
            viewer: viewer,
            tocPane: _tocPane,
            get action() {
                return options.action;
            }
        });
        return {
            get document() {
                return _document;
            },
            get toolbar() {
                return _toolbar;
            },
            get tocPane() {
                return _tocPane;
            },
            get parametersPane() {
                return _parametersPane;
            },
            get searchPane() {
                return _searchPane;
            },
            get errorPane() {
                return _errorsPane;
            },
            get sidebarState() {
                return viewer.sidebarState;
            },
            get hasParameters() {
                return _paramsExists;
            },
            get hasToc() {
                return _hasToc;
            },
            processPage: function(element) {
                $.each(viewer.document().resolveActionItems(element), function(index, item) {
                    _interactivityProcessor.processActionItem(item, element);
                }), _interactivityProcessor.processActions(element);
            },
            setSidebarState: function(state) {
                viewer.sidebarState(state);
            }
        };
    }
    function parseUri(str) {
        for (var o = parseUri.options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {}, i = 14; i--; ) uri[o.key[i]] = m[i] || "";
        return uri[o.q.name] = {}, uri[o.key[12]].replace(o.q.parser, function(match, first, second) {
            first && (uri[o.q.name][first] = second);
        }), uri;
    }
    function createViewer(options) {
        var baseUri = options.baseUri || ".", resourceManager = ResourceManager(), reportService = ReportServiceSelector(options.reportService, resourceManager), templates = Templates(baseUri, resourceManager), printingService = PrintingService(), browserSpecific = BrowserSpecific(), services = {
            reportService: reportService,
            templates: templates,
            resourceManager: resourceManager,
            printingService: printingService,
            browserSpecific: browserSpecific
        }, viewerModel = ViewerModel(reportService, options);
        return ViewerImpl(services, options, {
            viewerModel: viewerModel,
            viewerViewModel: ViewerViewModel(services, options, viewerModel)
        });
    }
    !function($) {
        "use strict";
        $.fn.bootstrapSwitch = function(method) {
            var methods = {
                init: function() {
                    return this.each(function() {
                        var $div, $switchLeft, $switchRight, $label, color, moving, $element = $(this), myClasses = "", classes = $element.attr("class"), onLabel = "ON", offLabel = "OFF", icon = !1;
                        $.each([ "switch-mini", "switch-small", "switch-large" ], function(i, el) {
                            classes.indexOf(el) >= 0 && (myClasses = el);
                        }), $element.addClass("has-switch"), void 0 !== $element.data("on") && (color = "switch-" + $element.data("on")), 
                        void 0 !== $element.data("on-label") && (onLabel = $element.data("on-label")), void 0 !== $element.data("off-label") && (offLabel = $element.data("off-label")), 
                        void 0 !== $element.data("icon") && (icon = $element.data("icon")), $switchLeft = $("<span>").addClass("switch-left").addClass(myClasses).addClass(color).html(onLabel), 
                        color = "", void 0 !== $element.data("off") && (color = "switch-" + $element.data("off")), 
                        $switchRight = $("<span>").addClass("switch-right").addClass(myClasses).addClass(color).html(offLabel), 
                        $label = $("<label>").html("&nbsp;").addClass(myClasses).attr("for", $element.find("input").attr("id")), 
                        icon && $label.html('<i class="icon icon-' + icon + '"></i>'), $div = $element.find(":checkbox").wrap($("<div>")).parent().data("animated", !1), 
                        $element.data("animated") !== !1 && $div.addClass("switch-animate").data("animated", !0), 
                        $div.append($switchLeft).append($label).append($switchRight), $element.find(">div").addClass($element.find("input").is(":checked") ? "switch-on" : "switch-off"), 
                        $element.find("input").is(":disabled") && $(this).addClass("deactivate");
                        var changeStatus = function($this) {
                            $this.siblings("label").trigger("mousedown").trigger("mouseup").trigger("click");
                        };
                        $element.on("keydown", function(e) {
                            32 === e.keyCode && (e.stopImmediatePropagation(), e.preventDefault(), changeStatus($(e.target).find("span:first")));
                        }), $switchLeft.on("click", function(e) {
                            changeStatus($(this));
                        }), $switchRight.on("click", function(e) {
                            changeStatus($(this));
                        }), $element.find("input").on("change", function(e) {
                            var $this = $(this), $element = $this.parent(), thisState = $this.is(":checked"), state = $element.is(".switch-off");
                            e.preventDefault(), $element.css("left", ""), state === thisState && (thisState ? $element.removeClass("switch-off").addClass("switch-on") : $element.removeClass("switch-on").addClass("switch-off"), 
                            $element.data("animated") !== !1 && $element.addClass("switch-animate"), $element.parent().trigger("switch-change", {
                                el: $this,
                                value: thisState
                            }));
                        }), $element.find("label").on("mousedown touchstart", function(e) {
                            var $this = $(this);
                            moving = !1, e.preventDefault(), e.stopImmediatePropagation(), $this.closest("div").removeClass("switch-animate"), 
                            $this.closest(".has-switch").is(".deactivate") ? $this.unbind("click") : ($this.on("mousemove touchmove", function(e) {
                                var $element = $(this).closest(".switch"), relativeX = (e.pageX || e.originalEvent.targetTouches[0].pageX) - $element.offset().left, percent = relativeX / $element.width() * 100, left = 25, right = 75;
                                moving = !0, left > percent ? percent = left : percent > right && (percent = right), 
                                $element.find(">div").css("left", percent - right + "%");
                            }), $this.on("click touchend", function(e) {
                                var $this = $(this), $target = $(e.target), $myCheckBox = $target.siblings("input");
                                e.stopImmediatePropagation(), e.preventDefault(), $this.unbind("mouseleave"), moving ? $myCheckBox.prop("checked", !(parseInt($this.parent().css("left")) < -25)) : $myCheckBox.prop("checked", !$myCheckBox.is(":checked")), 
                                moving = !1, $myCheckBox.trigger("change");
                            }), $this.on("mouseleave", function(e) {
                                var $this = $(this), $myCheckBox = $this.siblings("input");
                                e.preventDefault(), e.stopImmediatePropagation(), $this.unbind("mouseleave"), $this.trigger("mouseup"), 
                                $myCheckBox.prop("checked", !(parseInt($this.parent().css("left")) < -25)).trigger("change");
                            }), $this.on("mouseup", function(e) {
                                e.stopImmediatePropagation(), e.preventDefault(), $(this).unbind("mousemove");
                            }));
                        });
                    });
                },
                toggleActivation: function() {
                    $(this).toggleClass("deactivate");
                },
                isActive: function() {
                    return !$(this).hasClass("deactivate");
                },
                setActive: function(active) {
                    active ? $(this).removeClass("deactivate") : $(this).addClass("deactivate");
                },
                toggleState: function(skipOnChange) {
                    var $input = $(this).find("input:checkbox");
                    $input.prop("checked", !$input.is(":checked")).trigger("change", skipOnChange);
                },
                setState: function(value, skipOnChange) {
                    $(this).find("input:checkbox").prop("checked", value).trigger("change", skipOnChange);
                },
                status: function() {
                    return $(this).find("input:checkbox").is(":checked");
                },
                destroy: function() {
                    var $checkbox, $div = $(this).find("div");
                    return $div.find(":not(input:checkbox)").remove(), $checkbox = $div.children(), 
                    $checkbox.unwrap().unwrap(), $checkbox.unbind("change"), $checkbox;
                }
            };
            return methods[method] ? methods[method].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof method && method ? void $.error("Method " + method + " does not exist!") : methods.init.apply(this, arguments);
        };
    }(jQuery), $(function() {
        $(".switch").bootstrapSwitch();
    }), function(factory) {
        factory(window.jQuery);
    }(function($) {
        $.fn.spin = function(opts, color) {
            return this.each(function() {
                var $this = $(this), data = $this.data();
                data.spinner && (data.spinner.stop(), delete data.spinner), opts !== !1 && (opts = $.extend({
                    color: color || $this.css("color")
                }, $.fn.spin.presets[opts] || opts), data.spinner = new Spinner(opts).spin(this));
            });
        }, $.fn.spin.presets = {
            tiny: {
                lines: 8,
                length: 2,
                width: 2,
                radius: 3
            },
            small: {
                lines: 8,
                length: 4,
                width: 3,
                radius: 5
            },
            large: {
                lines: 10,
                length: 8,
                width: 4,
                radius: 8
            }
        };
    }), !function(a, b) {
        "object" == typeof module && module.exports ? module.exports = b() : "function" == typeof define && define.amd ? define(b) : a.Spinner = b();
    }(this, function() {
        "use strict";
        function a(a, b) {
            var c, d = document.createElement(a || "div");
            for (c in b) d[c] = b[c];
            return d;
        }
        function b(a) {
            for (var b = 1, c = arguments.length; c > b; b++) a.appendChild(arguments[b]);
            return a;
        }
        function c(a, b, c, d) {
            var e = [ "opacity", b, ~~(100 * a), c, d ].join("-"), f = .01 + c / d * 100, g = Math.max(1 - (1 - a) / b * (100 - f), a), h = j.substring(0, j.indexOf("Animation")).toLowerCase(), i = h && "-" + h + "-" || "";
            return m[e] || (k.insertRule("@" + i + "keyframes " + e + "{0%{opacity:" + g + "}" + f + "%{opacity:" + a + "}" + (f + .01) + "%{opacity:1}" + (f + b) % 100 + "%{opacity:" + a + "}100%{opacity:" + g + "}}", k.cssRules.length), 
            m[e] = 1), e;
        }
        function d(a, b) {
            var c, d, e = a.style;
            if (b = b.charAt(0).toUpperCase() + b.slice(1), void 0 !== e[b]) return b;
            for (d = 0; d < l.length; d++) if (c = l[d] + b, void 0 !== e[c]) return c;
        }
        function e(a, b) {
            for (var c in b) a.style[d(a, c) || c] = b[c];
            return a;
        }
        function f(a) {
            for (var b = 1; b < arguments.length; b++) {
                var c = arguments[b];
                for (var d in c) void 0 === a[d] && (a[d] = c[d]);
            }
            return a;
        }
        function g(a, b) {
            return "string" == typeof a ? a : a[b % a.length];
        }
        function h(a) {
            this.opts = f(a || {}, h.defaults, n);
        }
        function i() {
            function c(b, c) {
                return a("<" + b + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', c);
            }
            k.addRule(".spin-vml", "behavior:url(#default#VML)"), h.prototype.lines = function(a, d) {
                function f() {
                    return e(c("group", {
                        coordsize: k + " " + k,
                        coordorigin: -j + " " + -j
                    }), {
                        width: k,
                        height: k
                    });
                }
                function h(a, h, i) {
                    b(m, b(e(f(), {
                        rotation: 360 / d.lines * a + "deg",
                        left: ~~h
                    }), b(e(c("roundrect", {
                        arcsize: d.corners
                    }), {
                        width: j,
                        height: d.scale * d.width,
                        left: d.scale * d.radius,
                        top: -d.scale * d.width >> 1,
                        filter: i
                    }), c("fill", {
                        color: g(d.color, a),
                        opacity: d.opacity
                    }), c("stroke", {
                        opacity: 0
                    }))));
                }
                var i, j = d.scale * (d.length + d.width), k = 2 * d.scale * j, l = -(d.width + d.length) * d.scale * 2 + "px", m = e(f(), {
                    position: "absolute",
                    top: l,
                    left: l
                });
                if (d.shadow) for (i = 1; i <= d.lines; i++) h(i, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
                for (i = 1; i <= d.lines; i++) h(i);
                return b(a, m);
            }, h.prototype.opacity = function(a, b, c, d) {
                var e = a.firstChild;
                d = d.shadow && d.lines || 0, e && b + d < e.childNodes.length && (e = e.childNodes[b + d], 
                e = e && e.firstChild, e = e && e.firstChild, e && (e.opacity = c));
            };
        }
        var j, k, l = [ "webkit", "Moz", "ms", "O" ], m = {}, n = {
            lines: 12,
            length: 7,
            width: 5,
            radius: 10,
            scale: 1,
            corners: 1,
            color: "#000",
            opacity: .25,
            rotate: 0,
            direction: 1,
            speed: 1,
            trail: 100,
            fps: 20,
            zIndex: 2e9,
            className: "spinner",
            top: "50%",
            left: "50%",
            shadow: !1,
            hwaccel: !1,
            position: "absolute"
        };
        if (h.defaults = {}, f(h.prototype, {
            spin: function(b) {
                this.stop();
                var c = this, d = c.opts, f = c.el = a(null, {
                    className: d.className
                });
                if (e(f, {
                    position: d.position,
                    width: 0,
                    zIndex: d.zIndex,
                    left: d.left,
                    top: d.top
                }), b && b.insertBefore(f, b.firstChild || null), f.setAttribute("role", "progressbar"), 
                c.lines(f, c.opts), !j) {
                    var g, h = 0, i = (d.lines - 1) * (1 - d.direction) / 2, k = d.fps, l = k / d.speed, m = (1 - d.opacity) / (l * d.trail / 100), n = l / d.lines;
                    !function o() {
                        h++;
                        for (var a = 0; a < d.lines; a++) g = Math.max(1 - (h + (d.lines - a) * n) % l * m, d.opacity), 
                        c.opacity(f, a * d.direction + i, g, d);
                        c.timeout = c.el && setTimeout(o, ~~(1e3 / k));
                    }();
                }
                return c;
            },
            stop: function() {
                var a = this.el;
                return a && (clearTimeout(this.timeout), a.parentNode && a.parentNode.removeChild(a), 
                this.el = void 0), this;
            },
            lines: function(d, f) {
                function h(b, c) {
                    return e(a(), {
                        position: "absolute",
                        width: f.scale * (f.length + f.width) + "px",
                        height: f.scale * f.width + "px",
                        background: b,
                        boxShadow: c,
                        transformOrigin: "left",
                        transform: "rotate(" + ~~(360 / f.lines * k + f.rotate) + "deg) translate(" + f.scale * f.radius + "px,0)",
                        borderRadius: (f.corners * f.scale * f.width >> 1) + "px"
                    });
                }
                for (var i, k = 0, l = (f.lines - 1) * (1 - f.direction) / 2; k < f.lines; k++) i = e(a(), {
                    position: "absolute",
                    top: 1 + ~(f.scale * f.width / 2) + "px",
                    transform: f.hwaccel ? "translate3d(0,0,0)" : "",
                    opacity: f.opacity,
                    animation: j && c(f.opacity, f.trail, l + k * f.direction, f.lines) + " " + 1 / f.speed + "s linear infinite"
                }), f.shadow && b(i, e(h("#000", "0 0 4px #000"), {
                    top: "2px"
                })), b(d, b(i, h(g(f.color, k), "0 0 1px rgba(0,0,0,.1)")));
                return d;
            },
            opacity: function(a, b, c) {
                b < a.childNodes.length && (a.childNodes[b].style.opacity = c);
            }
        }), "undefined" != typeof document) {
            k = function() {
                var c = a("style", {
                    type: "text/css"
                });
                return b(document.getElementsByTagName("head")[0], c), c.sheet || c.styleSheet;
            }();
            var o = e(a("group"), {
                behavior: "url(#default#VML)"
            });
            !d(o, "transform") && o.adj ? i() : j = d(o, "animation");
        }
        return h;
    });
    var ServiceParameterType = {
        String: 0,
        DateTime: 1,
        Bool: 2,
        Int: 3,
        Float: 4
    }, ticksOffsetFromUnixEpoch = 621355968e9, ticksInMillisecond = 1e4, millisecondsInMinute = 6e4;
    !function() {
        function extend(proto, prop, value) {
            proto[prop] || Object.defineProperty(proto, prop, {
                value: value,
                writable: !0,
                configurable: !0,
                enumerable: !1
            });
        }
        extend(Boolean, "parse", function(x) {
            switch (typeof x) {
              case "boolean":
                return x;

              case "string":
                switch (x.toLowerCase()) {
                  case "true":
                    return !0;

                  case "false":
                    return !1;

                  default:
                    var n = parseFloat(x);
                    return !isNaN(n) && 0 !== n;
                }

              default:
                return !1;
            }
        }), extend(String.prototype, "trim", function() {
            return this.replace(/^\s+|\s+$/g, "");
        }), extend(String.prototype, "format", function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return "undefined" != typeof args[number] ? args[number] : match;
            });
        }), extend(String.prototype, "startsWith", function(str) {
            return 0 === this.indexOf(str, 0);
        }), extend(String.prototype, "endsWith", function(str) {
            return -1 !== this.indexOf(str, this.length - str.length);
        }), extend(String.prototype, "right", function(nn) {
            return this.length > nn ? this.substr(this.length - nn) : this;
        }), extend(Date, "isDate", function(date) {
            return date instanceof Date && !isNaN(date.valueOf());
        }), extend(Date, "format", function(x, format) {
            var $c = {
                dayNames: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
                abbreviatedDayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
                shortestDayNames: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ],
                firstLetterDayNames: [ "S", "M", "T", "W", "T", "F", "S" ],
                monthNames: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
                abbreviatedMonthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
                amDesignator: "AM",
                pmDesignator: "PM"
            }, ord = function(n) {
                switch (1 * n) {
                  case 1:
                  case 21:
                  case 31:
                    return "st";

                  case 2:
                  case 22:
                    return "nd";

                  case 3:
                  case 23:
                    return "rd";

                  default:
                    return "th";
                }
            }, p = function(s, l) {
                return l || (l = 2), ("000" + s).slice(-1 * l);
            };
            return format ? format.replace(/(\\)?(dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|S)/g, function(m) {
                if ("\\" === m.charAt(0)) return m.replace("\\", "");
                switch (m) {
                  case "hh":
                    return p(x.getHours() < 13 ? 0 === x.getHours() ? 12 : x.getHours() : x.getHours() - 12);

                  case "h":
                    return x.getHours() < 13 ? 0 === x.getHours() ? 12 : x.getHours() : x.getHours() - 12;

                  case "HH":
                    return p(x.getHours());

                  case "H":
                    return x.getHours();

                  case "mm":
                    return p(x.getMinutes());

                  case "m":
                    return x.getMinutes();

                  case "ss":
                    return p(x.getSeconds());

                  case "s":
                    return x.getSeconds();

                  case "yyyy":
                    return p(x.getFullYear(), 4);

                  case "yy":
                    return p(x.getFullYear());

                  case "dddd":
                    return $c.dayNames[x.getDay()];

                  case "ddd":
                    return $c.abbreviatedDayNames[x.getDay()];

                  case "dd":
                    return p(x.getDate());

                  case "d":
                    return x.getDate();

                  case "MMMM":
                    return $c.monthNames[x.getMonth()];

                  case "MMM":
                    return $c.abbreviatedMonthNames[x.getMonth()];

                  case "MM":
                    return p(x.getMonth() + 1);

                  case "M":
                    return x.getMonth() + 1;

                  case "t":
                    return x.getHours() < 12 ? $c.amDesignator.substring(0, 1) : $c.pmDesignator.substring(0, 1);

                  case "tt":
                    return x.getHours() < 12 ? $c.amDesignator : $c.pmDesignator;

                  case "S":
                    return ord(x.getDate());

                  default:
                    return m;
                }
            }) : x.toString();
        }), extend(Array.prototype, "clone", function() {
            return this.slice(0);
        }), extend(Array.prototype, "remove", function() {
            for (var what, ax, a = arguments, l = a.length; l && this.length; ) for (what = a[--l]; -1 !== (ax = this.indexOf(what)); ) this.splice(ax, 1);
            return this;
        });
    }();
    var DocumentState = {
        init: "init",
        progress: "progress",
        completed: "completed",
        error: "error"
    };
    Enum.prototype = {
        contains: function(item) {
            var self = this;
            return Object.keys(self).map(function(propertyName) {
                return self[propertyName];
            }).some(function(propertyValue) {
                return propertyValue === item;
            });
        },
        notContains: function(item) {
            return !this.contains(item);
        }
    };
    var ParameterType = new Enum();
    ParameterType.String = "string", ParameterType.DateTime = "datetime", ParameterType.Bool = "bool", 
    ParameterType.Int = "int", ParameterType.Float = "float";
    var ParameterState = new Enum();
    ParameterState.Ok = "Ok", ParameterState.ExpectValue = "ExpectValue", ParameterState.HasOutstandingDependencies = "HasOutstandingDependencies", 
    ParameterState.ValidationFailed = "ValidationFailed", ParameterState.DynamicValuesUnavailable = "DynamicValuesUnavailable", 
    ParameterState.ClientValidationFailed = "ClientValidationFailed";
    var ParameterEditorType = new Enum();
    ParameterEditorType.SelectOneFromMany = "SelectOneFromMany", ParameterEditorType.MultiValue = "MultiValue", 
    ParameterEditorType.MultiLine = "MultiLine", ParameterEditorType.SingleValue = "SingleValue";
    var ParameterSpecialValue = new Enum();
    ParameterSpecialValue.SelectAll = {
        toString: function() {
            return "(SELECT ALL)";
        }
    };
    var ExportType = new Enum();
    ExportType.Pdf = "Pdf", ExportType.Word = "Word", ExportType.Image = "Image", ExportType.Html = "Html", 
    ExportType.Xls = "Xls";
    var ActionType = new Enum();
    ActionType.hyperlink = 0, ActionType.bookmark = 1, ActionType.drillthrough = 2, 
    ActionType.toggle = 3;
    var SidebarState = new Enum();
    SidebarState.Hidden = "Hidden", SidebarState.Search = "Search", SidebarState.Parameters = "Parameters", 
    SidebarState.TOC = "TOC", ko.bindingHandlers.activeTab = {
        init: function(element, valueAccessor) {
            function update() {
                var tab = value();
                $e.find(".tab-pane").removeClass("active"), $e.find("[data-tab-name=" + tab + "]").addClass("active");
            }
            var value = valueAccessor(), $e = $(element);
            update(), ko.isObservable(value) && value.subscribe(update);
        }
    }, ko.bindingHandlers.treeNode = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = valueAccessor(), $e = $(element);
            $e.find(".toggle").click(function() {
                if ($e.toggleClass("collapsed").toggleClass("expanded"), $e.hasClass("expanded") && !$e.hasClass("loaded")) {
                    $e.toggleClass("loaded");
                    var node = options.node;
                    "function" == typeof node.kids && node.kids();
                    var div = $("<div/>").appendTo($e);
                    ko.renderTemplate(options.template, bindingContext.createChildContext(node), {}, div[0]);
                }
                return !1;
            });
        }
    }, ko.bindingHandlers.spin = {
        init: function(element, valueAccessor) {
            function update() {
                visible() ? $(element).spin("load") : $(element).spin(!1);
            }
            var visible = valueAccessor();
            visible.subscribe(update), update();
        }
    }, ko.bindingHandlers.resizeViewerBody = {
        init: function(element) {
            function resize() {
                var tb1 = $e.find(".toolbar-top"), tb2 = $e.find(".toolbar-bottom"), h1 = tb1.length ? tb1.outerHeight(!0) : 0, h2 = tb2.length ? tb2.outerHeight(!0) : 0, height = $e.height() - h1 - h2;
                $e.find(".viewer-body").css("height", height + "px"), $e.find(".sidebar").css("height", height + "px");
            }
            function watchResize() {
                var state = [ $e.height(), $e.find(".toolbar-top").length, $e.find(".toolbar-bottom").length ];
                currentState.filter(function(v, i) {
                    return v != state[i];
                }).length && (currentState = state, resize());
            }
            var $e = $(element).parent(), currentState = [ $e.height(), $e.find(".toolbar-top").length, $e.find(".toolbar-bottom").length ];
            resize(), setInterval(watchResize, 10);
        }
    }, ko.bindingHandlers.scrollPosition = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            value.subscribe(function() {
                var pos = value();
                $(element).scrollLeft(pos.left).scrollTop(pos.top);
            });
        }
    }, ko.bindingHandlers.showPanel = {
        init: function(element, valueAccessor, _, viewModel) {
            function update() {
                observable() ? $e.fadeIn().show() : $e.fadeOut().hide();
            }
            var observable = valueAccessor(), $e = $(element);
            update(), observable.subscribe(update), $e.on("click", "button.close", function() {
                observable(!1);
            });
        }
    }, ko.bindingHandlers.valueEdit = {
        init: function(element, valueAccessor) {
            function update() {
                $e.is(":focus") || $e.val(value());
            }
            var value = valueAccessor(), $e = $(element);
            value.subscribe(update), $e.focus(function() {
                var f = value.text;
                $e.val("function" == typeof f ? f.call(value) : ""), setTimeout(function() {
                    $e.select();
                }, 10);
            }).focusout(function() {
                $e.val(value());
            }).keydown(function(event) {
                var k = event.which ? event.which : event.keyCode;
                if (13 == k) {
                    event.preventDefault();
                    var oldVal = value();
                    return value($e.val()), oldVal != value() && $e.blur(), !1;
                }
                return !0;
            }), update();
        }
    }, ko.bindingHandlers.command = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var cmd = valueAccessor(), handlerAccessor = function() {
                return function() {
                    cmd.exec();
                };
            };
            ko.bindingHandlers.click.init(element, handlerAccessor, allBindings, viewModel, bindingContext);
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var cmd = valueAccessor(), enabled = function() {
                return cmd.hasOwnProperty("enabled") ? cmd.enabled : !0;
            };
            ko.bindingHandlers.enable.update(element, enabled, allBindings, viewModel, bindingContext), 
            ko.bindingHandlers.active.update(element, enabled, allBindings, viewModel, bindingContext);
        }
    }, ko.bindingHandlers.htmlPage = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            ko.bindingHandlers.html.init(element, function() {
                return valueAccessor().page;
            }, allBindings, viewModel, bindingContext);
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var settings = valueAccessor();
            ko.bindingHandlers.html.update(element, function() {
                return settings.page;
            }, allBindings, viewModel, bindingContext), settings.onupdate && settings.onupdate.apply && settings.onupdate(element);
        }
    }, ko.bindingHandlers.bootstrapSwitch = {
        init: function(element, valueAccessor) {
            var value = valueAccessor(), switchEl = $(element);
            switchEl.bootstrapSwitch(), switchEl.bootstrapSwitch("setState", value()), switchEl.on("switch-change", function(e, data) {
                value(data.value);
            }), value.subscribe(function() {
                switchEl.bootstrapSwitch("setState", value());
            });
        }
    }, ko.bindingHandlers.allowBindings = {
        init: function(elem, valueAccessor) {
            var shouldAllowBindings = ko.utils.unwrapObservable(valueAccessor());
            return {
                controlsDescendantBindings: !shouldAllowBindings
            };
        }
    }, ko.bindingHandlers.dropdownForm = {
        init: function(elem, valueAccessor) {
            var formOptions = ko.utils.unwrapObservable(valueAccessor());
            formOptions.onApply && $(elem).on("hidden.bs.dropdown", function() {
                formOptions.onApply(!0);
            }), formOptions.onShown && $(elem).on("shown.bs.dropdown", formOptions.onShown), 
            $(elem).on("click", ".dropdown-menu", function(e) {
                $(this).hasClass("dropdown-menu-form") && e.stopPropagation();
            });
        }
    }, ko.bindingHandlers.showEditor = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            function closeEditor(ok) {
                ko.removeNode(editor), editorOptions.onClose && editorOptions.onClose.apply && editorOptions.onClose(ok || !1), 
                editor.hide(), editor.html("");
            }
            var editorOptions = ko.utils.unwrapObservable(valueAccessor()), editor = $(editorOptions.placeholder);
            editor.hide(), editor.html("");
            var clickHandler = function() {
                editor.hide(), editorOptions.enable === !1 || editorOptions.enable && editorOptions.enable.apply && editorOptions.enable() === !1 || ko.renderTemplate(editorOptions.template, viewModel, {
                    afterRender: function() {
                        editor.show(), editor.find("*:input[type=text]:first").focus().select(), editor.find("button.close, .close-onclick").click(function() {
                            closeEditor(!0);
                        }), editorOptions.visible && editorOptions.visible.subscribe && editorOptions.visible.subscribe(function(visible) {
                            visible || closeEditor(!1);
                        });
                    }
                }, editor[0], "replaceChildren");
            };
            ko.bindingHandlers.click.init(element, function() {
                return clickHandler;
            }, allBindings, viewModel, bindingContext);
        }
    }, ko.bindingHandlers.active = {
        update: function(element, valueAccessor) {
            $(element).attr("disabled", !ko.unwrap(valueAccessor()));
        }
    }, ko.subscriptions = function() {
        var list = [];
        return list.dispose = function() {
            return list.forEach(function(s) {
                s.dispose();
            }), list.length = 0, list;
        }, list;
    }, ko.promise = function(promiseFn, target) {
        var value = ko.observable();
        return ko.dependentObservable(function() {
            promiseFn.call(target).done(value);
        }), value;
    }, ko.deferredArray = function(promiseFn) {
        var array = ko.observable(null);
        return ko.computed({
            read: function() {
                return null === array() && (array([]), promiseFn().done(function(value) {
                    array(value);
                })), array();
            },
            deferEvaluation: !0
        });
    }, ko.waitFor = function(value, predicate, callback) {
        function unsubscr() {
            subscr && (subscr.dispose(), subscr = null);
        }
        if (predicate(value())) return callback(value()), noop;
        var subscr = value.subscribe(function(newValue) {
            predicate(newValue) && (unsubscr(), callback(newValue));
        });
        return unsubscr;
    }, "undefined" != typeof module && module.exports && (require("./Common.js"), module.exports.toJson = convertPropertiesToJson);
    var ReportModelState = {
        noReport: "noReport",
        open: "open",
        documentReady: "documentReady",
        error: "error",
        closed: "closed"
    }, ReportType = {
        unknown: 0,
        pageReport: 1,
        sectionReport: 2
    };
    !function($) {
        $.fn.attrs = function() {
            for (var map = {}, attrs = this[0].attributes, i = 0; i < attrs.length; i++) {
                var name = attrs[i].name;
                map[name.toLowerCase()] = attrs[i].value;
            }
            return map;
        }, $.fn.spin.presets.load = {
            lines: 13,
            length: 16,
            width: 6,
            radius: 18,
            corners: 1,
            rotate: 0,
            direction: 1,
            color: "#000",
            speed: 1,
            trail: 60,
            shadow: !0,
            hwaccel: !0,
            className: "spinner",
            left: "50%",
            top: "50%"
        };
    }(jQuery), parseUri.options = {
        strictMode: !1,
        key: [ "source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    }, window.GrapeCity = {
        ActiveReports: {
            Viewer: createViewer
        }
    };
}(window);