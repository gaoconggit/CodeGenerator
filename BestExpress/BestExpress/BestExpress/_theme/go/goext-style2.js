/// <reference path="../tool/_reference.js" />


function goChart(data) {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram =
      $(go.Diagram, "myDiagramDiv",
        {
            initialContentAlignment: go.Spot.Center,
            maxSelectionCount: 1,
            validCycle: go.Diagram.CycleDestinationTree, // make sure users can only create trees
            layout:
              $(go.TreeLayout,
                {
                    treeStyle: go.TreeLayout.StyleLastParents,
                    arrangement: go.TreeLayout.ArrangementHorizontal,
                    //设置公用属性
                    angle: 90,//角度
                    layerSpacing: 150,//层间距
                    //最后一层父级节点的属性:
                    alternateAngle: 0,//转角
                    alternateAlignment: go.TreeLayout.AlignmentStart,//交替排列
                    alternateNodeIndent: 40,//备用层节点缩进
                    alternateNodeIndentPastParent: 1,//备用层节点缩进到父级节点
                    alternateNodeSpacing: 40,//备用层节点间距
                    alternateLayerSpacing: 80,//备用层节点交替的层间距
                    alternateLayerSpacingParentOverlap: 1,//备用层间距父重叠
                    alternatePortSpot: new go.Spot(0, 0.999, 20, 0),
                    alternateChildPortSpot: go.Spot.Left
                }),
            "undoManager.isEnabled": false // enable undo & redo
        });

    // when the document is modified, add a "*" to the title and enable the "Save" button
    myDiagram.addDiagramListener("Modified", function (e) {
        var button = document.getElementById("SaveButton");
        if (button) button.disabled = !myDiagram.isModified;
        var idx = document.title.indexOf("*");
        if (myDiagram.isModified) {
            if (idx < 0) document.title += "*";
        } else {
            if (idx >= 0) document.title = document.title.substr(0, idx);
        }
    });

    var levelColors = ["#5133AB/#643EBF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF",
                       "#2672EC/#2E8DEF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF"];

    // override TreeLayout.commitNodes to also modify the background brush based on the tree depth level
    myDiagram.layout.commitNodes = function () {
        go.TreeLayout.prototype.commitNodes.call(myDiagram.layout);  // do the standard behavior
        // then go through all of the vertexes and set their corresponding node's Shape.fill
        // to a brush dependent on the TreeVertex.level value
        myDiagram.layout.network.vertexes.each(function (v) {
            if (v.node) {
                var level = v.level % (levelColors.length);
                var colors = levelColors[level].split("/");
                var shape = v.node.findObject("SHAPE");
                if (shape) shape.fill = $(go.Brush, "Linear", { 0: colors[0], 1: colors[1], start: go.Spot.Left, end: go.Spot.Right });
            }
        });
    };

    // 添加双击事件
    function nodeDoubleClick(e, obj) {
        var vguid = obj.data.VGUID;
        if (vguid != "00000000-0000-0000-0000-000000000000") {
            var url = "/Personnel/PerDetail/Index?VGUID=" + vguid;
            window.open(url);
        }
    }

    // this is used to determine feedback during drags
    function mayWorkFor(node1, node2) {
        if (!(node1 instanceof go.Node)) return false;  // must be a Node
        if (node1 === node2) return false;  // cannot work for yourself
        if (node2.isInTreeOf(node1)) return false;  // cannot work for someone who works for you
        return true;
    }


    function textStyle() {
        return { font: "9pt  Segoe UI,sans-serif", stroke: "white" };
    }
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        { doubleClick: nodeDoubleClick },//双击添加子节点
        { // handle dragging a Node onto a Node to (maybe) change the reporting relationship
            mouseDragEnter: function (e, node, prev) {
                var diagram = node.diagram;
                var selnode = diagram.selection.first();
                if (!mayWorkFor(selnode, node)) return;
                var shape = node.findObject("SHAPE");
                if (shape) {
                    shape._prevFill = shape.fill;  // remember the original brush
                    shape.fill = "darkred";
                }
            },
            mouseDragLeave: function (e, node, next) {
                var shape = node.findObject("SHAPE");
                if (shape && shape._prevFill) {
                    shape.fill = shape._prevFill;  // restore the original brush
                }
            },
            mouseDrop: function (e, node) {
                var diagram = node.diagram;
                var selnode = diagram.selection.first();  // assume just one Node in selection
                if (mayWorkFor(selnode, node)) {
                    // find any existing link into the selected node
                    var link = selnode.findTreeParentLink();
                    if (link !== null) {  // reconnect any existing link
                        link.fromNode = node;
                    } else {  // else create a new link
                        diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
                    }
                }
            }
        },
        // for sorting, have the Node.text be the data.name
        new go.Binding("text", "name"),
        // bind the Part.layerName to control the Node's layer depending on whether it isSelected
        new go.Binding("layerName", "isSelected", function (sel) { return sel ? "Foreground" : ""; }).ofObject(),
        // define the node's outer shape
        $(go.Shape, "Rectangle",
          {
              name: "SHAPE", fill: "white", stroke: null, width: 231,
              // set the port properties:
              portId: "", fromLinkable: true, toLinkable: true, cursor: "pointer"

          }, new go.Binding("fill", "isHighlighted", function (h) { return h ? "#e53c3c" : "#2672EC"; }).ofObject()),
        $(go.Panel, "Horizontal",
          $(go.Picture,
            {
                name: 'Picture',
                desiredSize: new go.Size(80, 100),
                margin: new go.Margin(3, 3, 3, 3),

            },
            new go.Binding("source", "imgPath")),
          // define the panel where the text will appear
          $(go.Panel, "Table",
            {
                maxSize: new go.Size(150, 999),
                margin: new go.Margin(6, 10, 0, 3),
                defaultAlignment: go.Spot.Left,
                width: 130
            },
            $(go.RowColumnDefinition, { column: 2, width: 4 }),
            $(go.TextBlock, textStyle(),  // the name
              {
                  row: 0, column: 0, columnSpan: 5,
                  font: "12pt Segoe UI,sans-serif",
                  editable: false, isMultiline: false,

              },
              new go.Binding("text", "name").makeTwoWay()),
            $(go.TextBlock, "", textStyle(),
              {
                  row: 1, column: 0,

              }),
            $(go.TextBlock, textStyle(),
              {
                  row: 1, column: 0, columnSpan: 4,
                  editable: false, isMultiline: false,
                  minSize: new go.Size(10, 14),
                  margin: new go.Margin(5, 0, 5, 3)
              },
              new go.Binding("text", "ActualAccount").makeTwoWay()),
            $(go.TextBlock, textStyle(),
              {
                  row: 2, column: 0,
                  margin: new go.Margin(5, 0, 5, 3)
              },
              new go.Binding("text", "BudgetAccount", function (v) { return v; }))
            //$(go.TextBlock, textStyle(),
            //  { row: 2, column: 3, },
            //  new go.Binding("text", "", function (v) { return "上级: " +  myDiagram.model.findNodeDataForKey(v.parent).name  }))

          )  // end Table Panel
        ) // end Horizontal Panel
      );  // end Node

    // define the Link template
    myDiagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { corner: 5, relinkableFrom: true, relinkableTo: true },
        $(go.Shape, { strokeWidth: 4, stroke: "#00a4a4" }));  // the link shape


    // 定义链接模板，一个简单的正交线
    myDiagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { selectable: false },
        $(go.Shape, { strokeWidth: 1, stroke: '#6bb5f2' }));  // 链接线宽2px黑色
    //概述
    myOverview =
      $(go.Overview, "myOverviewDiv",
        { observed: myDiagram, contentAlignment: go.Spot.Center }
         );

    // 设置节点数据数组
    var nodeDataArray = data;
    // 用数据创建模型树
    myDiagram.model =
      $(go.TreeModel,
        {
            nodeParentKeyProperty: "parent",  // 引用父节点数据
            nodeDataArray: nodeDataArray//填充数据
        });



}



function searchDiagram() {  // 查询
    var input = document.getElementById("mySearch");
    if (!input) return;
    input.focus();
    var regex = new RegExp(input.value, "i");
    myDiagram.startTransaction("highlight search");
    myDiagram.clearHighlighteds();
    if (input.value) {
        var results = myDiagram.findNodesByExample({ name: regex },
                                                   { imgPath: regex },
                                                   { ActualAccount: regex },
                                                   { BudgetAccount: regex });
        myDiagram.highlightCollection(results);
        if (results.count > 0) myDiagram.centerRect(results.first().actualBounds);
        else jqxAlert($pageLanguage.SearchDataNoFound);
    }
    myDiagram.commitTransaction("highlight search");
}



//圆心图-----------------------------------------
function goIncrementalTree(data) {
    // 双击事件触发方法
    function nodeDoubleClick(e, obj) {
        debugger
        var vguid = obj.data.VGUID;
        if (vguid == null || vguid == "") {
            return;
        }
        var url = "/Personnel/PerDetail/Index?VGUID=" + obj.data.VGUID;
        window.open(url);
    }
    var $ = go.GraphObject.make;
    var blues = ['#E1F5FE', '#B3E5FC', '#81D4FA', '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1', '#0277BD', '#01579B'];
    myDiagram =
     $(go.Diagram, "myDiagramDiv",
       {
           initialAutoScale: go.Diagram.UniformToFill,
           contentAlignment: go.Spot.Center,
           layout: $(go.ForceDirectedLayout),
           "draggingTool.dragsTree": true,
           "undoManager.isEnabled": false
       });
    myDiagram.nodeTemplate =
     $(go.Node, "Spot",
           { doubleClick: nodeDoubleClick },//双击添加子节点
       {
           selectionObjectName: "PANEL",
           isTreeExpanded: false,
           isTreeLeaf: false
       },
       // the node's outer shape, which will surround the text
       $(go.Panel, "Auto",
         { name: "PANEL" },
         $(go.Shape, "Circle",
           { fill: "whitesmoke", stroke: "black" },
           new go.Binding("fill", "rootdistance", function (dist) {
               dist = Math.min(blues.length - 1, dist);
               return blues[dist];
           })),
         $(go.TextBlock,
           { font: "12px sans-serif", margin: 2 },
           new go.Binding("text", "name"))
       ),
       //展开按钮 
       $("TreeExpanderButton",
         {
             name: 'TREEBUTTON',
             width: 20, height: 20,
             alignment: go.Spot.TopRight,
             alignmentFocus: go.Spot.Center,
             click: function (e, obj) {
                 var node = obj.part;
                 if (node === null) return;
                 e.handled = true;
                 expandNode(node);
             }

         }
       )
     );
    var nodeDataArray = data;

    myDiagram.model = new go.TreeModel([
     {
         key: nodeDataArray[0].key,
         name: nodeDataArray[0].name,
         VGUID: nodeDataArray[0].VGUID,
         nodeParentKeyProperty: "parent",  // 引用父节点数据
         nodeDataArray: nodeDataArray//填充数据
     },
    ]);
    expandAtRandom();
}
function isAnyfunction(data, NodeKey, notNode, number) {
    var modelNode = NodeKey != null ? NodeKey : [];
    var modelnotNode = notNode != null ? notNode : [];
    if (number == 3) {
        return
    }
    if (number != 0) {
        for (var j = 0 ; j < NodeKey.length; j++) {
            for (var i = 1; i < data.nodeDataArray.length; i++) {
                var reuslt = NodeKey[j] == data.nodeDataArray[i].parent;
                if (reuslt) {
                    modelnotNode.push(NodeKey[j]);
                }
            }
        }
    }
    else {
        for (var i = 1; i < data.nodeDataArray.length; i++) {
            var reuslt = data.key == data.nodeDataArray[i].parent;
            if (reuslt) {
                modelNode.push(data.nodeDataArray[i].key);
            }
        }
    }
    isAnyfunction(data, modelNode, modelnotNode, $.convert.toInt(number + 1));
}
function expandNode(node) {
    var diagram = node.diagram;
    diagram.startTransaction("CollapseExpandTree");
    var data = node.data;
    if (!data.everExpanded) {

        diagram.model.setDataProperty(data, "everExpanded", true);
        var numchildren = createSubTree(data);
        if (numchildren === 0) {  // 没有子节点删除添加按钮
            node.findObject('TREEBUTTON').visible = false;
        }
    }

    // this behavior is generic for most expand/collapse tree buttons:
    if (node.isTreeExpanded) {
        diagram.commandHandler.collapseTree(node);
    } else {
        diagram.commandHandler.expandTree(node);
    }
    diagram.commitTransaction("CollapseExpandTree");
    myDiagram.zoomToFit();
}

//创建子节点
function createSubTree(parentdata) {
    var numchildren = 0;
    var modelData = [];
    for (var i = 0; i < parentdata.nodeDataArray.length; i++) {
        var reuslt = parentdata.key == parentdata.nodeDataArray[i].parent;
        var Node;
        numchildren = $.convert.toInt(numchildren) + $.convert.toInt(reuslt ? 1 : 0);
        if (reuslt) {
            modelData.push(parentdata.nodeDataArray[i]);
        }
    }
    if (myDiagram.model.count <= 1) {
        numchildren += 1;
    }
    var parent = myDiagram.findNodeForData(parentdata);
    var degrees = 1;
    var grandparent = parent.findTreeParentNode();
    while (grandparent) {
        degrees++;
        grandparent = grandparent.findTreeParentNode();
    }

    var model = myDiagram.model; //节点模型
    var modelNode = [];//获取第二级节点
    var modelnotNode = [];//有子节点的数据
    isAnyfunction(parentdata, modelNode, modelnotNode, 0);
    //添加节点
    for (var i = 0; i < numchildren; i++) {
        var childdata = {
            key: modelData[i].key,
            name: modelData[i].name,
            VGUID: modelData[i].VGUID,
            parent: parentdata.key,
            rootdistance: degrees,
            nodeDataArray: parentdata.nodeDataArray
        };
        model.addNodeData(childdata);
        var child = myDiagram.findNodeForData(childdata);
        //控制+号
        var index = $.inArray(child.data.key, modelnotNode);
        index >= 0 ? child.findObject('TREEBUTTON').visible = true : child.findObject('TREEBUTTON').visible = false;
        child.location = parent.location;
    }
}

function expandAtRandom() {
    var eligibleNodes = [];
    myDiagram.nodes.each(function (n) {
        if (!n.isTreeExpanded) eligibleNodes.push(n);
    })
    expandNode(eligibleNodes[0]);
}