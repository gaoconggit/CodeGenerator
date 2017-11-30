/// <reference path="../tool/_reference.js" />
var $nw_maintenanceBasicInfo = function () {
    var i = 1000;
    var j = 20;
    this.init = function () {
        addEvent();


    };
    var selector = {
        
        $positontype: function () { return $("#PositonType"); },
        $specialty: function () { return $("#Specialty"); },
        $household: function () { return $("#Household"); },
        $transfertype: function () { return $("#TransferType"); },
        $transferstatus: function () { return $("#TransferStatus"); },
        $basicinfofiletransferindate: function () { return $("#BasicInfoFileTransferInDate"); },
        $politicallandscape: function () { return $("#PoliticalLandscape"); },
        $companyworkyearcalctype: function () { return $("#CompanyWorkYearCalcType"); },
        $socialsecurityaccount: function () { return $("#SocialSecurityAccount"); },
        $providentfundaccount: function () { return $("#ProvidentFundAccount"); }
    }
    function addEvent() {
        hiddenText();
    }
    function hiddenText() {
        $.action.setTimeoutWidthNum(function () { selector.$companyworkyearcalctype().text("—") }, i, j)
       // $.action.setTimeoutWidthNum(function () { selector.$hometown().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$positontype().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$specialty().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$household().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$transfertype().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$transferstatus().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$basicinfofiletransferindate().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$politicallandscape().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$socialsecurityaccount().text("—") }, i, j)
        $.action.setTimeoutWidthNum(function () { selector.$providentfundaccount().text("—") }, i, j)
       
    }
};
$(function () {
    var nw_maintenanceBasicInfo = new $nw_maintenanceBasicInfo();
    if (
        $.request.areaName().ejq_TryToLower() == "personnel"
        && $.request.controllerName().ejq_TryToLower() == "maintenancebasicinfo"
        && $.request.actionName().ejq_TryToLower() == "index") {
        nw_maintenanceBasicInfo.init();
    }
});


