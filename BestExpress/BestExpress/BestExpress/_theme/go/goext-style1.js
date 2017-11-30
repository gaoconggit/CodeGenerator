/// <reference path="go.js" />
///<reference path="/_theme/tool/_reference.js" />
function goChart(data) {
    var $ = go.GraphObject.make;
    myDiagram = $(go.Diagram, "myDiagramDiv",
       {
           //初始化对齐方式   在顶部居中
           initialDocumentSpot: go.Spot.TopCenter,
           initialViewportSpot: go.Spot.TopCenter,
           layout:
             $(go.TreeLayout,  // 设置tree的所有节点
               {
                   treeStyle: go.TreeLayout.StyleLastParents,
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
               })
       });
    //概述
    myOverview =
      $(go.Overview, "myOverviewDiv",
        { observed: myDiagram, contentAlignment: go.Spot.Center }
         );



    //文字转换
    function theInfoTextConverter(info) {
        var str = "";
        if (info.ActualAccount) str += "" + $pageLanguage.Actual + " : " + info.ActualAccount;
        if (info.BudgetAccount) str += "\t\t\t" + $pageLanguage.Budget + " : " + info.BudgetAccount;

        return str;
    }
    var graygrad = $(go.Brush, "Linear", { 0: "#F5F5F5", 1: "#F1F1F1" });
    //颜色数组
    var levelColors = ["#5133AB/#643EBF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF",
                       "#2672EC/#2E8DEF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF", "#2672EC/#2E8DEF"];
    //按级别填色
    myDiagram.layout.commitNodes = function () {
        go.TreeLayout.prototype.commitNodes.call(myDiagram.layout);
        myDiagram.layout.network.vertexes.each(function (v) {
            if (v.node) {
                var level = v.level % (levelColors.length);
                var colors = levelColors[level].split("/");
                var shape = v.node.findObject("SHAPE");
                if (shape) shape.fill = $(go.Brush, "Linear", { 0: colors[0], 1: colors[1], start: go.Spot.Left, end: go.Spot.Right });
            }
        });
    };

    ///设置字体颜色


    // 定义节点模板
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",

        // { isShadowed: true },
           { doubleClick: nodeDoubleClick },//双击添加子节点
        //设置为矩形
        $(go.Shape, "Rectangle",
          {
              name: "SHAPE", fill: "white", stroke: null
          },

          /*选中就高亮显示  蓝色   否则为白色*/
          //new go.Binding("fill", "isHighlighted", function (h) { return h ? "#F44336" : "#B2EBF2"; }).ofObject()),
           new go.Binding("fill", "isHighlighted", function (h) { return h ? "#e53c3c" : "#2672EC"; }).ofObject()),

        // 节点的不同部分
        $(go.Panel, "Table",
          { margin: 6, maxSize: new go.Size(200, NaN) },
          // 左侧对齐
          $(go.RowColumnDefinition,
            {
                column: 0,
                stretch: go.GraphObject.Horizontal,
                alignment: go.Spot.Left,
            }),
          //设置文本信息绑定
          $(go.TextBlock,
            {
                row: 0, column: 0,
                maxSize: new go.Size(160, NaN), margin: 5,
                font: "bold 11pt helvetica, bold arial, sans-serif",
                // font: '500 16px Roboto, sans-serif',
                alignment: go.Spot.Top,
                stroke: "white"
            },
            new go.Binding("text", "name")),


          // 附加的文本信息
          $(go.TextBlock,
            {
                margin: 5,
                row: 1, column: 0, columnSpan: 2,
                font: "12px Roboto, sans-serif",
                stroke: "white"
            },
            new go.Binding("text", "", theInfoTextConverter))
        )
      );

    // 定义链接模板，一个简单的正交线
    myDiagram.linkTemplate =
      $(go.Link, go.Link.Orthogonal,
        { corner: 5, relinkableFrom: true, relinkableTo: true, selectable: false },
      $(go.Shape, { strokeWidth: 1, stroke: '#6bb5f2' }));  // 链接线宽2px黑色

    // 添加子节点方法
    function nodeDoubleClick(e, obj) {
        window.$pubInnerPage.goDoubleClick.showDiv(obj.data.TreeID);
    }
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
    debugger
    function nodeDoubleClick(e, obj) {
        window.$pubInnerPage.goDoubleClick.showDiv(obj.data.TreeID);
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
       $(go.Panel, "Auto",
         { name: "PANEL" },
         $(go.Shape, "Circle",
           { fill: "whitesmoke", stroke: "black" },
           new go.Binding("fill", "rootdistance", function (dist) {
               dist = Math.min(blues.length - 1, dist);
               return blues[2];
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

    //myDiagram.zoomToFit();
    myDiagram.model = new go.TreeModel([
     {
         key: nodeDataArray[0].key,
         name: nodeDataArray[0].name,
         TreeID: nodeDataArray[0].TreeID,
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
    debugger
    var diagram = node.diagram;
    diagram.startTransaction("CollapseExpandTree");
    // this behavior is specific to this incrementalTree sample:

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
            TreeID: modelData[i].TreeID,
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


